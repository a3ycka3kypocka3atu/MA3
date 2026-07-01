const SPREADSHEET_ID = '18JxwZgWl66mSAkGdCBHAB9EsHypZtYFDVqq2oviAkeI';
const ANSWERS_SHEET_NAME = 'Question answers';
const MAINTENANCE_TOKEN = '34forfree7-prohor-2026-06-25';

const TABLE_HEADERS = ['Вопрос', 'Ответ'];

const BLOCKS = [
  {
    title: 'A. Операционные вопросы',
    questions: [
      'Сколько сейчас обычно проходит времени от “клиент написал” до “выступление состоялось”?',
      'Добавь реальный контекст по срокам',
      'Откуда сейчас приходят запросы на выступления?',
      'Какие каналы реально дают самые качественные запросы?',
      'Есть ли уже premium-tier выступления или близкие к этому прецеденты?',
    ],
  },
  {
    title: 'B. Контент-производство',
    questions: [
      'Что ты сейчас снимаешь или уже имеешь в сырых материалах?',
      'Что из этого можно реально найти и передать нам?',
      'Есть ли stock-видео с прошлых выступлений?',
      'Какие события или поездки запланированы на ближайшие 6 месяцев?',
      'Есть ли UGC-команда или videographer на локации?',
      'Как сейчас выглядит реальный процесс съемки?',
    ],
  },
  {
    title: 'C. История и нарратив',
    questions: [
      'Какая твоя личная история в музыке — коротко, 3-5 предложений?',
      'Что тебя удерживает в музыке сейчас, когда сложно?',
      'Какой один момент карьеры был “тогда я понял, что это мое”?',
    ],
  },
  {
    title: 'D. Технические вопросы',
    questions: [
      'Техрайдер существует?',
      'Что точно должно быть в техрайдере?',
      'Длина сетов — какой минимальный и комфортный формат?',
      'Нужен ли back-up DJ на случай форс-мажора?',
      'Как сейчас закрываешь риски форс-мажора?',
    ],
  },
  {
    title: 'E. Партнерства и коллаборации',
    questions: [
      'С кем из артистов дружишь или уже работал?',
      'Есть ли лейбл, менеджмент или booking agent, с которыми готов сотрудничать в будущем?',
      'Кто из артистов в твоем жанре — уровень мечты?',
    ],
  },
  {
    title: 'F. Тон коммуникации',
    questions: [
      '3-5 слов, которыми тебя описывают друзья или фаны',
      'Что тебя бесит в музыкальной индустрии?',
      'С чем точно НЕ хочешь, чтобы ассоциировался твой бренд?',
    ],
  },
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(e);
    const sheet = getAnswerSheet();
    const answersByQuestion = readExistingAnswers(sheet);
    const updates = buildAnswerUpdates(payload);

    Object.keys(updates).forEach((question) => {
      answersByQuestion[normalizeQuestion(question)] = {
        question,
        answer: updates[question],
      };
    });

    const rows = renderGroupedAnswers(sheet, answersByQuestion);

    return jsonResponse({
      ok: true,
      rows,
      message: 'Saved to Google Sheets',
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'clear' && e.parameter.token === MAINTENANCE_TOKEN) {
    return jsonResponse(clearQuestionAnswersSheet());
  }

  if (e && e.parameter && e.parameter.action === 'compact' && e.parameter.token === MAINTENANCE_TOKEN) {
    return jsonResponse(compactQuestionAnswersSheet());
  }

  if (e && e.parameter && e.parameter.payload) {
    return doPost(e);
  }

  return jsonResponse({
    ok: true,
    app: '34ForFree7 Prohor intake collector',
    spreadsheetId: SPREADSHEET_ID,
  });
}

function compactQuestionAnswersSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(ANSWERS_SHEET_NAME) || spreadsheet.insertSheet(ANSWERS_SHEET_NAME);
  const answersByQuestion = readExistingAnswers(sheet);
  const rows = renderGroupedAnswers(sheet, answersByQuestion);

  cleanupExtraSheets(spreadsheet);

  return {
    ok: true,
    sheet: ANSWERS_SHEET_NAME,
    rows,
  };
}

function clearQuestionAnswersSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(ANSWERS_SHEET_NAME) || spreadsheet.insertSheet(ANSWERS_SHEET_NAME);
  const rows = renderGroupedAnswers(sheet, {});

  cleanupExtraSheets(spreadsheet);

  return {
    ok: true,
    sheet: ANSWERS_SHEET_NAME,
    cleared: true,
    rows,
  };
}

function cleanupExtraSheets(spreadsheet) {
  deleteSheetIfExists(spreadsheet, 'Raw submission events');
  deleteSheetIfExists(spreadsheet, 'Intake responses');
  deleteEmptySheetIfExists(spreadsheet, 'Sheet1');
}

function buildAnswerUpdates(payload) {
  const source = payload.sectionQuestionAnswers && payload.sectionQuestionAnswers.length
    ? payload.sectionQuestionAnswers
    : payload.allQuestionAnswers || [];
  const updates = {};
  const knownQuestions = getKnownQuestionsByKey();

  source.forEach((item) => {
    const question = item.question || '';
    const key = normalizeQuestion(question);

    if (!knownQuestions[key]) {
      return;
    }

    updates[knownQuestions[key]] = formatAnswer(item.answer);
  });

  return updates;
}

function readExistingAnswers(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const questionIndex = findHeaderIndex(headers, ['question', 'Вопрос']);
  const answerIndex = findHeaderIndex(headers, ['answer', 'Ответ']);
  const knownQuestions = getKnownQuestionsByKey();
  const answersByQuestion = {};

  values.slice(1).forEach((row) => {
    const question = questionIndex >= 0 ? row[questionIndex] : row[0];
    const answer = answerIndex >= 0 ? row[answerIndex] : row[1];
    const key = normalizeQuestion(question);

    if (!key || !knownQuestions[key] || isTestQuestion(key)) {
      return;
    }

    answersByQuestion[key] = {
      question: knownQuestions[key],
      answer: formatAnswer(answer),
    };
  });

  return answersByQuestion;
}

function renderGroupedAnswers(sheet, answersByQuestion) {
  const rows = [];
  const blockRowNumbers = [];

  BLOCKS.forEach((block) => {
    const questionRows = block.questions.map((question) => {
      const saved = answersByQuestion[normalizeQuestion(question)];
      return [question, saved ? saved.answer : ''];
    });

    rows.push([block.title, '']);
    blockRowNumbers.push(rows.length + 1);
    rows.push.apply(rows, questionRows);
  });

  sheet.clear();
  sheet.getRange(1, 1, 1, TABLE_HEADERS.length).setValues([TABLE_HEADERS]);
  sheet.setFrozenRows(1);

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, TABLE_HEADERS.length).setValues(rows);
  }

  if (sheet.getMaxColumns() > TABLE_HEADERS.length) {
    sheet.deleteColumns(TABLE_HEADERS.length + 1, sheet.getMaxColumns() - TABLE_HEADERS.length);
  }

  formatAnswerSheet(sheet, blockRowNumbers);
  return rows.length - blockRowNumbers.length;
}

function getAnswerSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(ANSWERS_SHEET_NAME) || spreadsheet.insertSheet(ANSWERS_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, TABLE_HEADERS.length).setValues([TABLE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function formatAnswerSheet(sheet, blockRowNumbers) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const fullRange = sheet.getRange(1, 1, lastRow, TABLE_HEADERS.length);

  sheet.setColumnWidth(1, 480);
  sheet.setColumnWidth(2, 360);
  fullRange.setWrap(true);
  fullRange.setFontWeight('normal');
  fullRange.setBackground('#ffffff');

  sheet.getRange(1, 1, 1, TABLE_HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#dbeafe');

  blockRowNumbers.forEach((rowNumber) => {
    sheet.getRange(rowNumber, 1, 1, TABLE_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#eef2ff');
  });
}

function getKnownQuestionsByKey() {
  const knownQuestions = {};

  BLOCKS.forEach((block) => {
    block.questions.forEach((question) => {
      knownQuestions[normalizeQuestion(question)] = question;
    });
  });

  return knownQuestions;
}

function deleteSheetIfExists(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);

  if (sheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(sheet);
  }
}

function deleteEmptySheetIfExists(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet || spreadsheet.getSheets().length <= 1) {
    return;
  }

  if (sheet.getLastRow() <= 1 && sheet.getLastColumn() <= 1 && !sheet.getRange(1, 1).getValue()) {
    spreadsheet.deleteSheet(sheet);
  }
}

function parsePayload(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  return JSON.parse(e.postData.contents);
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => {
    return candidates.includes(String(header).trim());
  });
}

function normalizeQuestion(value) {
  return String(value || '').trim().toLowerCase();
}

function isTestQuestion(value) {
  return value.indexOf('codex') !== -1
    || value.indexOf('get payload test') !== -1
    || value.indexOf('post test') !== -1
    || value.indexOf('does the script save') !== -1;
}

function formatAnswer(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function testWrite() {
  const payload = {
    sectionQuestionAnswers: [
      {
        question: 'Что тебя удерживает в музыке сейчас, когда сложно?',
        answer: 'Manual test answer',
      },
    ],
  };

  doPost({
    parameter: {
      payload: JSON.stringify(payload),
    },
  });
}
