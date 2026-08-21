'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createTelegramAccessControl,
  normalizeTelegramUserId,
  parseAdminTelegramUserIds,
  parseTelegramWorkspaceAssignments
} = require('./access-control');

test('normalizes only positive numeric Telegram user IDs', () => {
  assert.equal(normalizeTelegramUserId(123456789), '123456789');
  assert.equal(normalizeTelegramUserId(' 123456789 '), '123456789');
  assert.equal(normalizeTelegramUserId('@mutable_username'), null);
  assert.equal(normalizeTelegramUserId('-123456789'), null);
  assert.equal(normalizeTelegramUserId(0), null);
  assert.equal(normalizeTelegramUserId(Number.MAX_SAFE_INTEGER + 1), null);
});

test('parses an explicit admin user-ID allowlist without defaults', () => {
  assert.deepEqual([...parseAdminTelegramUserIds('')], []);
  assert.deepEqual(
    [...parseAdminTelegramUserIds('123456789, 987654321')],
    ['123456789', '987654321']
  );
});

test('rejects malformed or duplicate admin entries', () => {
  assert.throws(() => parseAdminTelegramUserIds('andrisav'), /invalid numeric user ID/);
  assert.throws(() => parseAdminTelegramUserIds('123,123'), /duplicate user ID/);
  assert.throws(() => parseAdminTelegramUserIds('123,'), /empty entry/);
});

test('parses explicit user-to-workspace assignments', () => {
  assert.deepEqual(
    [...parseTelegramWorkspaceAssignments('123456789:Client_Alpha,987654321:client_beta')],
    [
      ['123456789', 'client_alpha'],
      ['987654321', 'client_beta']
    ]
  );
});

test('rejects malformed workspace assignments', () => {
  assert.throws(
    () => parseTelegramWorkspaceAssignments('username:client_alpha'),
    /invalid numeric user ID/
  );
  assert.throws(
    () => parseTelegramWorkspaceAssignments('123:unsafe workspace'),
    /invalid workspace key/
  );
  assert.throws(
    () => parseTelegramWorkspaceAssignments('123:client_alpha,123:other'),
    /duplicate user ID/
  );
});

test('denies users when no immutable ID assignment exists', () => {
  const accessControl = createTelegramAccessControl();

  assert.equal(accessControl.resolveAccess('123456789'), null);
  assert.equal(accessControl.resolveAccess('@andrisav'), null);
  assert.equal(accessControl.isAdmin('123456789'), false);
});

test('grants admin access only from the numeric user-ID allowlist', () => {
  const accessControl = createTelegramAccessControl({
    adminUserIds: '123456789'
  });

  assert.deepEqual(accessControl.resolveAccess(123456789), {
    telegramUserId: '123456789',
    role: 'admin',
    workspaceKey: 'admin'
  });
  assert.equal(accessControl.resolveAccess('987654321'), null);
});

test('grants mapped clients only their configured workspace', () => {
  const accessControl = createTelegramAccessControl({
    workspaceAssignments: '987654321:client_alpha'
  });

  assert.deepEqual(accessControl.resolveAccess(987654321), {
    telegramUserId: '987654321',
    role: 'client',
    workspaceKey: 'client_alpha'
  });
  assert.equal(accessControl.resolveAccess('123456789'), null);
});

test('admin allowlisting takes precedence over a client assignment', () => {
  const accessControl = createTelegramAccessControl({
    adminUserIds: '123456789',
    workspaceAssignments: '123456789:client_alpha'
  });

  assert.equal(accessControl.resolveAccess('123456789').role, 'admin');
  assert.equal(accessControl.resolveAccess('123456789').workspaceKey, 'admin');
});
