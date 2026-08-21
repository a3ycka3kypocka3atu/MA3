(() => {
  'use strict';

  const config = window.CLIENT_SPACE_CONFIG || {};
  const SUPABASE_URL = String(config.supabaseUrl || '').replace(/\/$/, '');
  const SUPABASE_PUBLISHABLE_KEY = config.supabasePublishableKey || '';
  const LOCAL_PREFIX = 'client-cabinet:state:v1';
  const OPERATOR_ROLES = new Set(['owner', 'admin', 'team']);
  const syncNote = document.getElementById('sync-note');
  let syncMode = 'checking';

  function safeKey(value, fallback = 'starter') {
    const normalized = String(value || fallback).trim().toLowerCase();
    return /^[a-z0-9:_-]{1,120}$/.test(normalized) ? normalized : fallback;
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
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
    const label = mode === 'remote'
      ? ' Shared workspace'
      : mode === 'saving'
        ? ' Saving…'
        : mode === 'error'
          ? ' Sync unavailable'
          : ' Local preview';
    if (syncNote.lastChild) syncNote.lastChild.textContent = label;
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

  async function request(path, authContext, options = {}) {
    if (!canUseRemote(authContext)) {
      throw new Error('A configured authenticated Supabase session is required.');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: options.method || 'GET',
      headers: headers(authContext, {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.prefer ? { Prefer: options.prefer } : {}),
      }),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const detail = payload.message || payload.msg || payload.hint || `Workspace API returned ${response.status}.`;
      throw new Error(detail);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function queryPath(table, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    const serialized = query.toString();
    return serialized ? `${table}?${serialized}` : table;
  }

  async function getWorkspaceAccess(authContext) {
    if (authContext?.workspaceAccessPromise) return authContext.workspaceAccessPromise;

    const promise = (async () => {
      if (!canUseRemote(authContext)) {
        const isAdminPreview = Boolean(authContext?.isLocalPreview && authContext?.isAdmin);
        setSyncMode('local', 'Authenticated remote workspace access is not active in this preview.');
        return {
          memberships: [],
          workspaces: [],
          isOperator: isAdminPreview,
          mode: 'local',
        };
      }

      try {
        const memberships = await request(queryPath('workspace_members', {
          user_id: `eq.${authContext.user.id}`,
          select: 'workspace_id,role,created_at',
          order: 'created_at.asc',
        }), authContext);
        const workspaceIds = [...new Set(memberships.map((membership) => membership.workspace_id).filter(isUuid))];
        const workspaces = workspaceIds.length
          ? await request(queryPath('workspaces', {
              id: `in.(${workspaceIds.join(',')})`,
              select: 'id,slug,name,description,status,current_phase,current_focus,progress,latest_update_title,latest_update_body,latest_update_at,updated_at',
              order: 'created_at.asc',
            }), authContext)
          : [];
        const roleByWorkspace = new Map(memberships.map((membership) => [membership.workspace_id, membership.role]));
        const allowedWorkspaces = workspaces.map((workspace) => ({
          ...workspace,
          role: roleByWorkspace.get(workspace.id),
        }));
        setSyncMode('remote');
        return {
          memberships,
          workspaces: allowedWorkspaces,
          isOperator: memberships.some((membership) => OPERATOR_ROLES.has(membership.role)),
          mode: 'remote',
        };
      } catch (error) {
        setSyncMode('error', error.message);
        throw error;
      }
    })();

    authContext.workspaceAccessPromise = promise;
    return promise;
  }

  async function loadWorkspaceBundle(workspaceId, authContext) {
    if (!isUuid(workspaceId)) throw new Error('A valid workspace is required.');
    setSyncMode('checking');

    try {
      const [workspaces, contexts, tasks, requests, replies, forms, materials, deliverables, activity] = await Promise.all([
        request(queryPath('workspaces', {
          id: `eq.${workspaceId}`,
          select: 'id,slug,name,description,status,current_phase,current_focus,progress,latest_update_title,latest_update_body,latest_update_at,updated_at',
          limit: '1',
        }), authContext),
        request(queryPath('project_context', {
          workspace_id: `eq.${workspaceId}`,
          select: 'workspace_id,objective,strategy,milestones,next_milestone,client_visible,updated_at',
          limit: '1',
        }), authContext),
        request(queryPath('tasks', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,title,description,category,effort,assignee_kind,assignee_user_id,status,priority,due_at,client_response,client_visible,created_at,updated_at,completed_at',
          order: 'created_at.desc',
        }), authContext),
        request(queryPath('requests', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,created_by,topic,title,message,status,client_visible,responded_at,resolved_at,created_at,updated_at',
          order: 'created_at.desc',
        }), authContext),
        request(queryPath('request_replies', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,request_id,workspace_id,author_id,body,client_visible,created_at',
          order: 'created_at.asc',
        }), authContext),
        request(queryPath('forms', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,title,description,definition,status,client_visible,created_at,updated_at',
          order: 'created_at.desc',
        }), authContext),
        request(queryPath('materials', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,title,description,kind,url,status,client_visible,published_at,created_at,updated_at',
          order: 'created_at.desc',
        }), authContext),
        request(queryPath('deliverables', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,title,description,url,status,client_visible,published_at,created_at,updated_at',
          order: 'created_at.desc',
        }), authContext),
        request(queryPath('activity', {
          workspace_id: `eq.${workspaceId}`,
          select: 'id,workspace_id,actor_id,event_type,entity_type,entity_id,summary,client_visible,metadata,created_at',
          order: 'created_at.desc',
          limit: '100',
        }), authContext),
      ]);

      if (!workspaces[0]) throw new Error('Workspace access was not found.');
      const repliesByRequest = new Map();
      replies.forEach((reply) => {
        const current = repliesByRequest.get(reply.request_id) || [];
        current.push(reply);
        repliesByRequest.set(reply.request_id, current);
      });

      setSyncMode('remote');
      return {
        workspace: workspaces[0],
        projectContext: contexts[0] || null,
        tasks,
        requests: requests.map((item) => ({ ...item, replies: repliesByRequest.get(item.id) || [] })),
        forms,
        materials,
        deliverables,
        activity,
      };
    } catch (error) {
      setSyncMode('error', error.message);
      throw error;
    }
  }

  async function createRequest(workspaceId, authContext, input) {
    const message = String(input.message || '').trim();
    const topic = String(input.topic || 'Other').trim().slice(0, 80) || 'Other';
    const title = String(input.title || `${topic} request`).trim().slice(0, 160);
    if (!isUuid(workspaceId) || !message) throw new Error('A workspace and message are required.');

    setSyncMode('saving');
    try {
      const rows = await request('requests', authContext, {
        method: 'POST',
        prefer: 'return=representation',
        body: {
          workspace_id: workspaceId,
          created_by: authContext.user.id,
          topic,
          title,
          message,
          status: 'waiting_team',
          client_visible: true,
        },
      });
      setSyncMode('remote');
      return rows[0];
    } catch (error) {
      setSyncMode('error', error.message);
      throw error;
    }
  }

  async function respondToRequest(requestId, authContext, responseBody) {
    const body = String(responseBody || '').trim();
    if (!isUuid(requestId) || !body) throw new Error('A request and response are required.');
    setSyncMode('saving');
    try {
      const replyId = await request('rpc/respond_to_request', authContext, {
        method: 'POST',
        body: { target_request_id: requestId, response_body: body },
      });
      setSyncMode('remote');
      return replyId;
    } catch (error) {
      setSyncMode('error', error.message);
      throw error;
    }
  }

  async function setClientTaskStatus(taskId, authContext, status) {
    setSyncMode('saving');
    try {
      const result = await request('rpc/set_client_task_status', authContext, {
        method: 'POST',
        body: { target_task_id: taskId, target_status: status },
      });
      setSyncMode('remote');
      return result;
    } catch (error) {
      setSyncMode('error', error.message);
      throw error;
    }
  }

  async function createTask(workspaceId, authContext, input) {
    const assigneeKind = input.assigneeKind === 'client' ? 'client' : 'team';
    const rows = await request('tasks', authContext, {
      method: 'POST',
      prefer: 'return=representation',
      body: {
        workspace_id: workspaceId,
        title: String(input.title || '').trim(),
        description: String(input.description || '').trim(),
        category: String(input.category || 'Project'),
        assignee_kind: assigneeKind,
        status: String(input.status || 'open'),
        priority: String(input.priority || 'medium'),
        client_visible: assigneeKind === 'client',
        created_by: authContext.user.id,
        updated_by: authContext.user.id,
      },
    });
    return rows[0];
  }

  async function updateTaskStatus(taskId, workspaceId, authContext, status) {
    const rows = await request(queryPath('tasks', {
      id: `eq.${taskId}`,
      workspace_id: `eq.${workspaceId}`,
    }), authContext, {
      method: 'PATCH',
      prefer: 'return=representation',
      body: { status },
    });
    if (!rows?.[0]) throw new Error('Task update was not authorized.');
    return rows[0];
  }

  // Local-only compatibility for preview mode. Authenticated MVP code uses
  // relational methods above and never writes coarse remote JSON documents.
  async function load(scope, authContext, options = {}) {
    const key = options.workspaceKey || authContext?.user?.id || 'preview';
    setSyncMode('local', 'Local preview state.');
    return {
      value: readLocal(scope, key, options.fallback ?? null),
      mode: 'local',
      workspaceKey: key,
    };
  }

  async function save(scope, authContext, value, options = {}) {
    const key = options.workspaceKey || authContext?.user?.id || 'preview';
    writeLocal(scope, key, value);
    setSyncMode('local', 'Local preview state.');
    return { mode: 'local', workspaceKey: key };
  }

  window.CABINET_DATA = Object.freeze({
    canUseRemote,
    createRequest,
    createTask,
    getMode: () => syncMode,
    getWorkspaceAccess,
    load,
    loadWorkspaceBundle,
    respondToRequest,
    save,
    setClientTaskStatus,
    updateTaskStatus,
  });
})();
