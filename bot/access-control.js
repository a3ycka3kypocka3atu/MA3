'use strict';

const TELEGRAM_USER_ID_PATTERN = /^[1-9]\d*$/;
const WORKSPACE_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

function normalizeTelegramUserId(value) {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }

  if (typeof value === 'bigint') {
    return value > 0n ? value.toString() : null;
  }

  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  return TELEGRAM_USER_ID_PATTERN.test(normalized) ? normalized : null;
}

function splitConfigEntries(value, variableName) {
  if (value === undefined || value === null || String(value).trim() === '') return [];
  if (typeof value !== 'string') {
    throw new TypeError(`${variableName} must be a comma-separated string.`);
  }

  const entries = value.split(',').map(entry => entry.trim());
  if (entries.some(entry => entry === '')) {
    throw new Error(`${variableName} contains an empty entry.`);
  }

  return entries;
}

function parseAdminTelegramUserIds(value = '') {
  const userIds = new Set();

  for (const entry of splitConfigEntries(value, 'ADMIN_TELEGRAM_USER_IDS')) {
    const userId = normalizeTelegramUserId(entry);
    if (!userId) {
      throw new Error(`ADMIN_TELEGRAM_USER_IDS contains an invalid numeric user ID: ${entry}`);
    }
    if (userIds.has(userId)) {
      throw new Error(`ADMIN_TELEGRAM_USER_IDS contains a duplicate user ID: ${userId}`);
    }
    userIds.add(userId);
  }

  return userIds;
}

function parseTelegramWorkspaceAssignments(value = '') {
  const assignments = new Map();

  for (const entry of splitConfigEntries(value, 'TELEGRAM_WORKSPACE_ASSIGNMENTS')) {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex <= 0 || separatorIndex !== entry.lastIndexOf(':')) {
      throw new Error(
        `TELEGRAM_WORKSPACE_ASSIGNMENTS entry must use numericUserId:workspaceKey: ${entry}`
      );
    }

    const rawUserId = entry.slice(0, separatorIndex).trim();
    const rawWorkspaceKey = entry.slice(separatorIndex + 1).trim();
    const userId = normalizeTelegramUserId(rawUserId);
    const workspaceKey = rawWorkspaceKey.toLowerCase();

    if (!userId) {
      throw new Error(`TELEGRAM_WORKSPACE_ASSIGNMENTS contains an invalid numeric user ID: ${rawUserId}`);
    }
    if (!WORKSPACE_KEY_PATTERN.test(workspaceKey)) {
      throw new Error(
        `TELEGRAM_WORKSPACE_ASSIGNMENTS contains an invalid workspace key: ${rawWorkspaceKey}`
      );
    }
    if (assignments.has(userId)) {
      throw new Error(`TELEGRAM_WORKSPACE_ASSIGNMENTS contains a duplicate user ID: ${userId}`);
    }

    assignments.set(userId, workspaceKey);
  }

  return assignments;
}

function createTelegramAccessControl({
  adminUserIds = '',
  workspaceAssignments = ''
} = {}) {
  const admins = parseAdminTelegramUserIds(adminUserIds);
  const assignments = parseTelegramWorkspaceAssignments(workspaceAssignments);

  function isAdmin(userId) {
    const normalizedUserId = normalizeTelegramUserId(userId);
    return Boolean(normalizedUserId && admins.has(normalizedUserId));
  }

  function resolveAccess(userId) {
    const normalizedUserId = normalizeTelegramUserId(userId);
    if (!normalizedUserId) return null;

    if (admins.has(normalizedUserId)) {
      return Object.freeze({
        telegramUserId: normalizedUserId,
        role: 'admin',
        workspaceKey: 'admin'
      });
    }

    const workspaceKey = assignments.get(normalizedUserId);
    if (!workspaceKey) return null;

    return Object.freeze({
      telegramUserId: normalizedUserId,
      role: 'client',
      workspaceKey
    });
  }

  return Object.freeze({ isAdmin, resolveAccess });
}

module.exports = {
  createTelegramAccessControl,
  normalizeTelegramUserId,
  parseAdminTelegramUserIds,
  parseTelegramWorkspaceAssignments
};
