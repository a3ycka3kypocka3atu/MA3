const SPREADSHEET_ID = '18JxwZgWl66mSAkGdCBHAB9EsHypZtYFDVqq2oviAkeI';
const SHEET_NAME = 'Intake responses';
const HEADERS = [
  'received_at',
  'event_type',
  'client_slug',
  'client_name',
  'respondent_id',
  'section_code',
  'section_id',
  'section_title',
  'progress_percent',
  'section_answers_json',
  'all_answers_json',
  'completed_sections_json',
  'page_url',
  'user_agent',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet();
    const payload = parsePayload(e);
    const client = payload.client || {};

    sheet.appendRow([
      new Date(),
      payload.eventType || '',
      client.slug || '',
      client.name || '',
      payload.respondentId || '',
      payload.sectionCode || '',
      payload.sectionId || '',
      payload.sectionTitle || '',
      payload.progressPercent || '',
      JSON.stringify(payload.sectionAnswers || {}),
      JSON.stringify(payload.allAnswers || {}),
      JSON.stringify(payload.completedSections || []),
      payload.pageUrl || '',
      payload.userAgent || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.payload) {
    return doPost(e);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, app: 'MA3 intake collector' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testWrite() {
  const sheet = getSheet();
  sheet.appendRow([
    new Date(),
    'manual_test',
    'prohor',
    'Prohor Music',
    'manual-test',
    'TEST',
    'test',
    'Manual Apps Script test',
    0,
    JSON.stringify({ status: 'manual test from Apps Script editor' }),
    JSON.stringify({ status: 'manual test from Apps Script editor' }),
    JSON.stringify(['test']),
    'Apps Script editor',
    'manual run',
  ]);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
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
