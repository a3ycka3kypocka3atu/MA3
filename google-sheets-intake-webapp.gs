const ANSWERS_SHEET_NAME = 'Question answers';
const CONFIG_KEYS = Object.freeze({
  spreadsheetId: 'PLATUM_INTAKE_SPREADSHEET_ID',
  writeToken: 'PLATUM_INTAKE_WRITE_TOKEN',
});

const TABLE_HEADERS = ['Question', 'Answer'];

const BLOCKS = [
  {
    title: 'A. Booking operations',
    questions: [
      'How long does it usually take from the first inquiry to the performance?',
      'Add real context about lead times',
      'Where do performance inquiries currently come from?',
      'Which channels produce the strongest inquiries?',
      'Do you already have premium-tier performances or close precedents?',
    ],
  },
  {
    title: 'B. Content production',
    questions: [
      'What do you currently record or already have as raw material?',
      'What can realistically be found and prepared?',
      'Is there footage from previous performances?',
      'Which events or trips are planned for the next six months?',
      'Is a videographer or content helper available on location?',
      'How does the recording process work today?',
    ],
  },
  {
    title: 'C. Story and narrative',
    questions: [
      'What is your personal story in music in three to five sentences?',
      'What keeps you in music when the work is difficult?',
      'Which career moment made you realize this was your path?',
    ],
  },
  {
    title: 'D. Technical readiness',
    questions: [
      'Does a technical rider exist?',
      'What must the technical rider include?',
      'What is the minimum and comfortable set length?',
      'Is a backup performer needed for emergencies?',
      'How are operational risks handled today?',
    ],
  },
  {
    title: 'E. Partnerships and collaborations',
    questions: [
      'Which artists do you know or have worked with?',
      'Which label, management, or booking partners could fit in the future?',
      'Which artists represent the level you want to reach?',
    ],
  },
  {
    title: 'F. Communication tone',
    questions: [
      'Which three to five words do friends or fans use to describe you?',
      'What frustrates you about the music industry?',
      'What should never be associated with your brand?',
    ],
  },
];

function doPost(e) {
  let lock;
  let lockAcquired = false;

  try {
    const config = getRequiredConfig();
    const payload = parseAuthorizedPayload(e, config.writeToken);

    lock = LockService.getScriptLock();
    lockAcquired = lock.tryLock(10000);

    if (!lockAcquired) {
      throw new Error('LOCK_UNAVAILABLE');
    }

    const sheet = getAnswerSheet(config.spreadsheetId);
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
      message: 'Answers saved',
    });
  } catch (error) {
    console.error('Intake write request rejected.');
    return jsonResponse({
      ok: false,
      error: 'Request rejected',
    });
  } finally {
    if (lock && lockAcquired) {
      lock.releaseLock();
    }
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    app: 'Platum artist strategy intake collector',
    writeMethod: 'authenticated POST only',
  });
}

function getRequiredConfig() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = String(properties.getProperty(CONFIG_KEYS.spreadsheetId) || '').trim();
  const writeToken = String(properties.getProperty(CONFIG_KEYS.writeToken) || '').trim();

  if (!spreadsheetId || writeToken.length < 32) {
    throw new Error('CONFIGURATION_REQUIRED');
  }

  return {
    spreadsheetId,
    writeToken,
  };
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
  const questionIndex = findHeaderIndex(headers, ['question']);
  const answerIndex = findHeaderIndex(headers, ['answer']);
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

  sheet.getRange(1, 1, 1, TABLE_HEADERS.length).setValues([TABLE_HEADERS]);
  sheet.setFrozenRows(1);

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, TABLE_HEADERS.length).setValues(rows);
  }

  formatAnswerSheet(sheet, blockRowNumbers, rows.length + 1);
  return rows.length - blockRowNumbers.length;
}

function getAnswerSheet(spreadsheetId) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(ANSWERS_SHEET_NAME) || spreadsheet.insertSheet(ANSWERS_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, TABLE_HEADERS.length).setValues([TABLE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function formatAnswerSheet(sheet, blockRowNumbers, managedLastRow) {
  const lastRow = Math.max(managedLastRow, 1);
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

function parseAuthorizedPayload(e, expectedWriteToken) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('POST_BODY_REQUIRED');
  }

  const request = JSON.parse(e.postData.contents);

  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new Error('INVALID_REQUEST');
  }

  if (!tokensMatch(request.writeToken, expectedWriteToken)) {
    throw new Error('AUTHORIZATION_REQUIRED');
  }

  if (!request.payload || typeof request.payload !== 'object' || Array.isArray(request.payload)) {
    throw new Error('PAYLOAD_REQUIRED');
  }

  return request.payload;
}

function tokensMatch(providedToken, expectedToken) {
  if (!providedToken || !expectedToken) {
    return false;
  }

  const providedDigest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(providedToken),
    Utilities.Charset.UTF_8
  );
  const expectedDigest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(expectedToken),
    Utilities.Charset.UTF_8
  );
  let difference = 0;

  for (let index = 0; index < expectedDigest.length; index += 1) {
    difference |= providedDigest[index] ^ expectedDigest[index];
  }

  return difference === 0;
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
  let formattedValue;

  if (Array.isArray(value)) {
    formattedValue = value.join(', ');
  } else if (value === null || value === undefined) {
    formattedValue = '';
  } else if (typeof value === 'object') {
    formattedValue = JSON.stringify(value);
  } else {
    formattedValue = String(value);
  }

  return /^[\s]*[=+\-@]/.test(formattedValue) ? `'${formattedValue}` : formattedValue;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
