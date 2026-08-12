(() => {
  'use strict';

  const config = window.CLIENT_SPACE_CONFIG || {};
  const SUPABASE_URL = config.supabaseUrl || '';
  const SUPABASE_PUBLISHABLE_KEY = config.supabasePublishableKey || '';
  const LOCAL_PREFIX = 'client-cabinet:state:v1';
  const syncNote = document.getElementById('sync-note');
  let syncMode = 'checking';

  function safeKey(value, fallback = 'starter') {
    const normalized = String(value || fallback).trim().toLowerCase();
    return /^[a-z0-9:_-]{1,120}$/.test(normalized) ? normalized : fallback;
  }

  function workspaceKey(authContext, requestedWorkspace) {
    if (authContext?.isAdmin && requestedWorkspace) return safeKey(requestedWorkspace, 'agency');
    const assigned = safeKey(authContext?.clientId, 'starter');
    if (assigned !== 'starter') return assigned;
    return `starter:${safeKey(authContext?.user?.id, 'preview')}`;
  }

  function localKey(scope, key) {
    return `${LOCAL_PREFIX}:${safeKey(key)}:${safeKey(scope, 'workspace')}`;
  }

  function readLocal(scope, key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(localKey(scope, key)));
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeLocal(scope, key, value) {
    localStorage.setItem(localKey(scope, key), JSON.stringify(value));
  }

  function setSyncMode(mode, detail = '') {
    syncMode = mode;
    if (!syncNote) return;
    syncNote.classList.toggle('is-local', mode !== 'remote');
    syncNote.classList.toggle('is-error', mode === 'error');
    syncNote.title = detail;
    syncNote.lastChild.textContent = mode === 'remote'
      ? ' Shared workspace'
      : mode === 'saving'
        ? ' Saving…'
        : mode === 'error'
          ? ' Saved locally · sync unavailable'
          : ' Saved on this device';
  }

  function canUseRemote(authContext) {
    return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && authContext?.accessToken);
  }

  function headers(authContext, extra = {}) {
    return {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${authContext.accessToken}`,
      ...extra,
    };
  }

  async function load(scope, authContext, options = {}) {
    const key = workspaceKey(authContext, options.workspaceKey);
    const fallback = readLocal(scope, key, options.fallback ?? null);
    if (!canUseRemote(authContext)) {
      setSyncMode('local', 'Remote sync requires an authenticated session.');
      return { value: fallback, mode: 'local', workspaceKey: key };
    }

    const query = new URLSearchParams({
      workspace_key: `eq.${key}`,
      state_key: `eq.${safeKey(scope, 'workspace')}`,
      select: 'state',
      limit: '1',
    });

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cabinet_workspace_states?${query}`, {
        headers: headers(authContext),
      });
      if (!response.ok) throw new Error(`Workspace sync returned ${response.status}.`);
      const rows = await response.json();
      const value = rows[0]?.state ?? fallback;
      if (rows[0]?.state !== undefined) writeLocal(scope, key, value);
      setSyncMode('remote');
      return { value, mode: 'remote', workspaceKey: key };
    } catch (error) {
      console.warn('Cabinet workspace sync is unavailable; using local state.', error);
      setSyncMode('error', error.message);
      return { value: fallback, mode: 'local', workspaceKey: key, error };
    }
  }

  async function save(scope, authContext, value, options = {}) {
    const key = workspaceKey(authContext, options.workspaceKey);
    writeLocal(scope, key, value);
    if (!canUseRemote(authContext)) {
      setSyncMode('local', 'Remote sync requires an authenticated session.');
      return { mode: 'local', workspaceKey: key };
    }

    setSyncMode('saving');
    const query = new URLSearchParams({ on_conflict: 'workspace_key,state_key' });
    const payload = {
      workspace_key: key,
      state_key: safeKey(scope, 'workspace'),
      state: value,
      updated_by: authContext.user.id,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cabinet_workspace_states?${query}`, {
        method: 'POST',
        headers: headers(authContext, {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Workspace sync returned ${response.status}.`);
      setSyncMode('remote');
      return { mode: 'remote', workspaceKey: key };
    } catch (error) {
      console.warn('Cabinet workspace could not be synced; the change is stored locally.', error);
      setSyncMode('error', error.message);
      return { mode: 'local', workspaceKey: key, error };
    }
  }

  window.CABINET_DATA = {
    getMode: () => syncMode,
    getWorkspaceKey: workspaceKey,
    load,
    save,
  };
})();
