const SPREADSHEET_ID = '18JxwZgWl66mSAkGdCBHAB9EsHypZtYFDVqq2oviAkeI';
const ANSWERS_SHEET_NAME = 'Question answers';
const RAW_EVENTS_SHEET_NAME = 'Raw submission events';

const ANSWERS_HEADERS = [
  'received_at',
  'submitted_at',
  'event_type',
  'client_slug',
  'client_name',
  'respondent_id',
  'section_code',
  'section_id',
  'section_title',
  'question_id',
  'question',
  'answer',
  'field_type',
  'progress_percent',
  'page_url',
  'user_agent',
];

const RAW_HEADERS = [
  'received_at',
  'submitted_at',
  'event_type',
  'client_slug',
  'client_name',
  'respondent_id',
  'section_code',
  'section_id',
  'section_title',
  'progress_percent',
  'section_answers_json',
  'section_question_answers_json',
  'all_answers_json',
  'completed_sections_json',
  'page_url',
  'user_agent',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(e);
    const rows = upsertQuestionAnswerRows(payload);
    appendRawEvent(payload);

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
  if (e && e.parameter && e.parameter.payload) {
    return doPost(e);
  }

  return jsonResponse({
    ok: true,
    app: 'MA3 Prohor intake collector',
    spreadsheetId: SPREADSHEET_ID,
  });
}

function upsertQuestionAnswerRows(payload) {
  const sheet = getSheet(ANSWERS_SHEET_NAME, ANSWERS_HEADERS);
  const rows = buildQuestionAnswerRows(payload);

  if (!rows.length) {
    return 0;
  }

  const existingRowsByKey = getExistingAnswerRowsByKey(sheet);
  const rowsToAppend = [];
  const duplicateRowNumbersToDelete = [];

  rows.forEach((row) => {
    const key = getQuestionAnswerRowKey(row);
    const existingRowNumbers = existingRowsByKey[key] || [];

    if (existingRowNumbers.length) {
      sheet.getRange(existingRowNumbers[0], 1, 1, row.length).setValues([row]);
      duplicateRowNumbersToDelete.push.apply(duplicateRowNumbersToDelete, existingRowNumbers.slice(1));
      return;
    }

    rowsToAppend.push(row);
  });

  deleteRowsFromBottom(sheet, duplicateRowNumbersToDelete);

  if (rowsToAppend.length) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length)
      .setValues(rowsToAppend);
  }

  return rows.length;
}

function getExistingAnswerRowsByKey(sheet) {
  const lastRow = sheet.getLastRow();
  const existingRowsByKey = {};

  if (lastRow < 2) {
    return existingRowsByKey;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, ANSWERS_HEADERS.length).getValues();
  values.forEach((row, index) => {
    const key = getQuestionAnswerRowKey(row);
    if (key) {
      if (!existingRowsByKey[key]) {
        existingRowsByKey[key] = [];
      }

      existingRowsByKey[key].push(index + 2);
    }
  });

  return existingRowsByKey;
}

function getQuestionAnswerRowKey(row) {
  const clientSlug = row[3] || '';
  const respondentId = row[5] || '';
  const sectionId = row[7] || '';
  const questionId = row[9] || '';

  if (!clientSlug || !respondentId || !sectionId || !questionId) {
    return '';
  }

  return [clientSlug, respondentId, sectionId, questionId].join('::');
}

function deleteRowsFromBottom(sheet, rowNumbers) {
  const uniqueRowNumbers = Array.from(new Set(rowNumbers)).sort((a, b) => b - a);
  uniqueRowNumbers.forEach((rowNumber) => {
    sheet.deleteRow(rowNumber);
  });
}

function buildQuestionAnswerRows(payload) {
  const receivedAt = new Date();
  const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : '';
  const client = payload.client || {};
  const questionAnswers = payload.sectionQuestionAnswers || [];

  return questionAnswers.map((item) => [
    receivedAt,
    submittedAt,
    payload.eventType || '',
    client.slug || '',
    client.name || '',
    payload.respondentId || '',
    item.sectionCode || payload.sectionCode || '',
    item.sectionId || payload.sectionId || '',
    item.sectionTitle || payload.sectionTitle || '',
    item.fieldId || '',
    item.question || '',
    formatAnswer(item.answer),
    item.fieldType || '',
    payload.progressPercent || '',
    payload.pageUrl || '',
    payload.userAgent || '',
  ]);
}

function appendRawEvent(payload) {
  const sheet = getSheet(RAW_EVENTS_SHEET_NAME, RAW_HEADERS);
  const client = payload.client || {};

  sheet.appendRow([
    new Date(),
    payload.submittedAt ? new Date(payload.submittedAt) : '',
    payload.eventType || '',
    client.slug || '',
    client.name || '',
    payload.respondentId || '',
    payload.sectionCode || '',
    payload.sectionId || '',
    payload.sectionTitle || '',
    payload.progressPercent || '',
    JSON.stringify(payload.sectionAnswers || {}),
    JSON.stringify(payload.sectionQuestionAnswers || []),
    JSON.stringify(payload.allAnswers || {}),
    JSON.stringify(payload.completedSections || []),
    payload.pageUrl || '',
    payload.userAgent || '',
  ]);
}

function getSheet(name, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const headersMatch = headers.every((header, index) => currentHeaders[index] === header);

  if (!headersMatch) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
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
    eventType: 'manual_test',
    submittedAt: new Date().toISOString(),
    client: {
      slug: 'prohor',
      name: 'Prohor Music',
    },
    respondentId: 'manual-test',
    sectionCode: 'TEST',
    sectionId: 'test',
    sectionTitle: 'Manual Apps Script test',
    progressPercent: 0,
    sectionAnswers: {
      test_question: 'test answer',
    },
    sectionQuestionAnswers: [
      {
        sectionCode: 'TEST',
        sectionId: 'test',
        sectionTitle: 'Manual Apps Script test',
        fieldId: 'test_question',
        fieldType: 'textarea',
        question: 'Does the script save questions and answers?',
        answer: 'Yes, this is a manual test row from Apps Script.',
      },
    ],
    allAnswers: {
      test_question: 'test answer',
    },
    completedSections: ['test'],
    pageUrl: 'Apps Script editor',
    userAgent: 'manual run',
  };

  upsertQuestionAnswerRows(payload);
  appendRawEvent(payload);
}
