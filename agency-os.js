(function () {
  'use strict';

  const STORAGE_KEY = 'client-cabinet:agency-os:v1';
  const LEGACY_STORAGE_KEY = 'cabinet:agency-os:prototype:v1';
  const STATE_VERSION = 1;
  const TASK_STATUSES = ['ready', 'in_progress', 'review', 'waiting_client', 'blocked', 'done'];

  const SEED = {
    workspaces: [
      {
        id: 'prohor',
        cabinetId: 'prohor',
        name: 'Prohor Music',
        initials: 'PM',
        kind: 'Client workspace',
        phase: 'Marketing foundation',
        progress: 42,
        health: 'attention',
        nextGate: 'Approve positioning and offer',
        summary: 'Premium artist positioning, booking funnel, media system, and measurable content learning.',
      },
      {
        id: 'agency',
        cabinetId: null,
        name: 'Internal operations',
        initials: 'AG',
        kind: 'Internal workspace',
        phase: 'Operating foundation',
        progress: 18,
        health: 'active',
        nextGate: 'Approve the first methodology library',
        summary: 'The agency runs through the same workspace model as clients, with internal visibility by default.',
      },
      {
        id: 'template',
        cabinetId: 'starter',
        name: 'New client template',
        initials: 'NC',
        kind: 'Reusable template',
        phase: 'Onboarding ready',
        progress: 5,
        health: 'ready',
        nextGate: 'Create a workspace from the first brief',
        summary: 'A clean cabinet and pipeline starting point for the next authenticated client.',
      },
    ],
    domains: [
      { id: 'marketing', name: 'Marketing', owner: 'Strategy team', status: 'active', description: 'Research, Client DNA, awareness, positioning, offer, and acquisition strategy.' },
      { id: 'media', name: 'Media', owner: 'Media team', status: 'waiting_client', description: 'Media strategy, content architecture, production, publishing, and learning.' },
      { id: 'growth', name: 'Growth', owner: 'Growth lead', status: 'planned', description: 'Hypotheses, experiments, paid campaigns, conversion, and scaling.' },
      { id: 'product', name: 'Product & Funnel', owner: 'Strategy team', status: 'planned', description: 'Product packaging, offers, lead magnets, landing pages, CRM, and onboarding.' },
    ],
    skills: [
      { id: 'business-context', number: '01', category: 'Foundation', name: 'Business Context Intake', goal: 'Turn a conversation and source files into a reliable project brief.', input: 'Interview, questionnaire, links, source files', output: 'Structured brief + missing-input list', quality: 'Facts and assumptions are separated; sources are linked', version: 'v0.1' },
      { id: 'deep-research', number: '02', category: 'Research', name: 'Deep Research', goal: 'Build an evidence-backed view of the business, market, audience, and context.', input: 'Brief, sources, research questions', output: 'Research dossier + source register', quality: 'Every important claim is sourced or labeled as a hypothesis', version: 'v0.1' },
      { id: 'market-landscape', number: '03', category: 'Research', name: 'Market Landscape', goal: 'Map categories, demand, alternatives, trends, and strategic openings.', input: 'Research dossier, market scope', output: 'Market map + opportunity areas', quality: 'Scope and confidence are explicit', version: 'v0.1' },
      { id: 'competitor-analysis', number: '04', category: 'Research', name: 'Competitor Analysis', goal: 'Compare relevant competitors by promise, proof, offer, channel, and customer experience.', input: 'Competitor set, public evidence', output: 'Comparison matrix + gaps', quality: 'Like-for-like comparison; no invented facts', version: 'v0.1' },
      { id: 'client-dna', number: '05', category: 'Strategy', name: 'Client DNA', goal: 'Create a shared, structured truth about the business and its customers.', input: 'Brief, research, interviews, analytics', output: 'Client DNA artifact', quality: 'Usable by every downstream domain without reinterpretation', version: 'v0.1' },
      { id: 'awareness-map', number: '06', category: 'Strategy', name: 'Awareness Map', goal: 'Map customer awareness from unaware to ready-to-buy and define the message needed at each level.', input: 'Client DNA, buying journey evidence', output: 'Awareness ladder + message jobs', quality: 'Stages reflect observable customer language and behavior', version: 'v0.1' },
      { id: 'positioning', number: '07', category: 'Strategy', name: 'Positioning', goal: 'Choose a valuable, credible, and differentiated place in the customer mind.', input: 'Client DNA, market, competitors, proof', output: 'Positioning system + guardrails', quality: 'Specific audience, alternative, value, proof, and boundaries', version: 'v0.1' },
      { id: 'offer-architecture', number: '08', category: 'Product', name: 'Offer Architecture', goal: 'Package value into a clear offer that reduces uncertainty and supports conversion.', input: 'Positioning, audience, proof, economics', output: 'Offer structure + proof plan', quality: 'Promise, mechanism, scope, proof, risk, and CTA align', version: 'v0.1' },
      { id: 'growth-math', number: '09', category: 'Growth', name: 'Growth Math', goal: 'Connect business targets to funnel volumes, conversion assumptions, and learning priorities.', input: 'Targets, price, conversion data, capacity', output: 'Growth model + sensitivity ranges', quality: 'Assumptions are visible and editable', version: 'v0.1' },
      { id: 'funnel-design', number: '10', category: 'Product', name: 'Funnel Design', goal: 'Design the steps from first attention to qualified action and retention.', input: 'Awareness map, offer, channels, growth math', output: 'Funnel map + measurement plan', quality: 'Each step has a user job, owner, CTA, and success signal', version: 'v0.1' },
      { id: 'media-strategy', number: '11', category: 'Media', name: 'Media Strategy', goal: 'Turn the marketing foundation into a channel and content system.', input: 'Client DNA, positioning, offers, awareness map', output: 'Media strategy + channel roles', quality: 'Every channel and format has a business role', version: 'v0.1' },
      { id: 'content-pillars', number: '12', category: 'Media', name: 'Content Architecture', goal: 'Create repeatable content pillars tied to audience needs and funnel movement.', input: 'Media strategy, audience questions, proof', output: 'Pillars, series, formats, CTAs', quality: 'Ideas can be generated repeatedly without losing strategy', version: 'v0.1' },
      { id: 'content-plan', number: '13', category: 'Media', name: 'Content Planning', goal: 'Convert strategy into a feasible production and publication plan.', input: 'Pillars, resources, calendar, priorities', output: 'Prioritized content backlog + calendar', quality: 'Capacity, dependencies, owner, platform, and intent are explicit', version: 'v0.1' },
      { id: 'script-development', number: '14', category: 'Media', name: 'Script Development', goal: 'Create production-ready scripts with a clear audience, hook, proof, and action.', input: 'Content brief, source context, format rules', output: 'Script + shot/asset notes', quality: 'Truthful, on-brand, platform-fit, and reviewable', version: 'v0.1' },
      { id: 'performance-analysis', number: '15', category: 'Learning', name: 'Performance Analysis', goal: 'Explain results and convert them into reusable learning and next experiments.', input: 'Content/campaign metadata, metrics, hypothesis', output: 'Finding + decision + next test', quality: 'Separates signal from noise and links back to the hypothesis', version: 'v0.1' },
    ],
    pipelines: [
      {
        id: 'marketing-foundation',
        workspaceId: 'prohor',
        domainId: 'marketing',
        name: 'Marketing Foundation',
        purpose: 'Move from raw client inputs to an approved positioning, offer, funnel, and strategy foundation.',
        version: 'Template v0.1',
        stages: [
          { name: 'Intake', skillId: 'business-context', status: 'done' },
          { name: 'Deep research', skillId: 'deep-research', status: 'done' },
          { name: 'Market', skillId: 'market-landscape', status: 'done' },
          { name: 'Client DNA', skillId: 'client-dna', status: 'review' },
          { name: 'Awareness', skillId: 'awareness-map', status: 'in_progress' },
          { name: 'Positioning', skillId: 'positioning', status: 'review' },
          { name: 'Offer', skillId: 'offer-architecture', status: 'blocked' },
          { name: 'Growth math', skillId: 'growth-math', status: 'planned' },
          { name: 'Funnel', skillId: 'funnel-design', status: 'planned' },
          { name: 'Approval', skillId: null, status: 'planned' },
        ],
      },
      {
        id: 'media-system',
        workspaceId: 'prohor',
        domainId: 'media',
        name: 'Media & Content Factory',
        purpose: 'Turn approved strategy into a repeatable loop from idea to published result and learning.',
        version: 'Template v0.1',
        stages: [
          { name: 'Media strategy', skillId: 'media-strategy', status: 'waiting_client' },
          { name: 'Pillars', skillId: 'content-pillars', status: 'planned' },
          { name: 'Backlog', skillId: 'content-plan', status: 'planned' },
          { name: 'Script', skillId: 'script-development', status: 'planned' },
          { name: 'Approval', skillId: null, status: 'planned' },
          { name: 'Production', skillId: null, status: 'planned' },
          { name: 'Publish', skillId: null, status: 'planned' },
          { name: 'Learn', skillId: 'performance-analysis', status: 'planned' },
        ],
      },
      {
        id: 'agency-os-adoption',
        workspaceId: 'agency',
        domainId: 'product',
        name: 'Agency OS Adoption',
        purpose: 'Turn the agency methodology into versioned skills, live client workflows, and measurable operating habits.',
        version: 'Internal v0.1',
        stages: [
          { name: 'Map method', skillId: null, status: 'in_progress' },
          { name: 'Write skills', skillId: null, status: 'in_progress' },
          { name: 'Pilot client', skillId: null, status: 'active' },
          { name: 'Review gaps', skillId: null, status: 'planned' },
          { name: 'Connect data', skillId: null, status: 'planned' },
          { name: 'Automate safely', skillId: null, status: 'planned' },
        ],
      },
    ],
    tasks: [
      { id: 't-101', workspaceId: 'prohor', domainId: 'marketing', skillId: 'client-dna', title: 'Review Client DNA confidence labels', description: 'Confirm which audience and booking claims are facts, hypotheses, or missing inputs.', assigneeType: 'human', assignee: 'Strategy lead', status: 'review', priority: 'high', due: 'This week', clientVisible: false },
      { id: 't-102', workspaceId: 'prohor', domainId: 'marketing', skillId: 'positioning', title: 'Approve positioning direction', description: 'Prepare the working positioning for client review and record the final decision.', assigneeType: 'client', assignee: 'Prohor', status: 'waiting_client', priority: 'high', due: 'Next gate', clientVisible: true },
      { id: 't-103', workspaceId: 'prohor', domainId: 'product', skillId: 'offer-architecture', title: 'Build premium booking offer', description: 'Package event fit, proof, process, scope, and inquiry next step.', assigneeType: 'agent', assignee: 'Unassigned AI', status: 'blocked', priority: 'high', due: 'After positioning', clientVisible: false },
      { id: 't-104', workspaceId: 'prohor', domainId: 'media', skillId: 'media-strategy', title: 'Collect filming workflow and content boundaries', description: 'Get the real capacity, raw materials, events, formats, and no-go topics from the client.', assigneeType: 'client', assignee: 'Prohor', status: 'waiting_client', priority: 'medium', due: 'This week', clientVisible: true },
      { id: 't-105', workspaceId: 'prohor', domainId: 'marketing', skillId: 'awareness-map', title: 'Draft the booking-buyer awareness map', description: 'Map messages from event-fit uncertainty to a confident inquiry.', assigneeType: 'agent', assignee: 'Codex / Claude / Hermes', status: 'ready', priority: 'medium', due: 'Ready now', clientVisible: false },
      { id: 't-106', workspaceId: 'prohor', domainId: 'marketing', skillId: 'competitor-analysis', title: 'Normalize competitor evidence', description: 'Make sources, dates, categories, and confidence consistent across the comparison.', assigneeType: 'human', assignee: 'Researcher', status: 'done', priority: 'medium', due: 'Completed', clientVisible: false },
      { id: 't-201', workspaceId: 'agency', domainId: 'marketing', skillId: null, title: 'Inventory the 15 current marketing skills', description: 'Find the latest source for each method and nominate an owner for version 0.1.', assigneeType: 'human', assignee: 'Methodology owner', status: 'in_progress', priority: 'high', due: 'This week', clientVisible: false },
      { id: 't-202', workspaceId: 'agency', domainId: 'product', skillId: null, title: 'Approve canonical task and artifact statuses', description: 'Use one state language across team, clients, and agents.', assigneeType: 'human', assignee: 'Agency team', status: 'review', priority: 'high', due: 'Next decision', clientVisible: false },
      { id: 't-203', workspaceId: 'agency', domainId: 'product', skillId: null, title: 'Deploy shared Supabase workspace model', description: 'Connect the correct project, apply the prepared RLS migration, and verify it with the security advisors.', assigneeType: 'human', assignee: 'Platform', status: 'blocked', priority: 'high', due: 'When project access is connected', clientVisible: false },
      { id: 't-204', workspaceId: 'agency', domainId: 'growth', skillId: 'performance-analysis', title: 'Define agency learning review', description: 'Decide how findings become decisions, skill improvements, and new experiments.', assigneeType: 'agent', assignee: 'Any approved model', status: 'ready', priority: 'medium', due: 'Ready now', clientVisible: false },
    ],
    artifacts: [
      { id: 'a-101', workspaceId: 'prohor', domainId: 'marketing', title: 'Research foundation', type: 'Research', version: 'v0.4', status: 'approved', visibility: 'internal', source: 'Brief + agency research', updated: '1 Aug 2026' },
      { id: 'a-102', workspaceId: 'prohor', domainId: 'marketing', title: 'Client DNA', type: 'Strategy', version: 'v0.3', status: 'ready_for_review', visibility: 'internal', source: 'Research foundation', updated: '1 Aug 2026' },
      { id: 'a-103', workspaceId: 'prohor', domainId: 'marketing', title: 'Positioning system', type: 'Decision', version: 'v0.5', status: 'ready_for_review', visibility: 'client', source: 'Client DNA + positioning board', updated: '1 Aug 2026' },
      { id: 'a-104', workspaceId: 'prohor', domainId: 'product', title: 'Booking funnel map', type: 'Funnel', version: 'v0.2', status: 'draft', visibility: 'internal', source: 'Positioning + booking evidence', updated: '1 Aug 2026' },
      { id: 'a-105', workspaceId: 'prohor', domainId: 'media', title: 'Content pillar draft', type: 'Media', version: 'v0.2', status: 'draft', visibility: 'internal', source: 'Working strategy', updated: '1 Aug 2026' },
      { id: 'a-201', workspaceId: 'agency', domainId: 'product', title: 'Agency OS vision', type: 'Method', version: 'v1.0', status: 'approved', visibility: 'internal', source: 'Agency operating vision', updated: '5 Aug 2026' },
      { id: 'a-202', workspaceId: 'agency', domainId: 'marketing', title: 'Marketing skill inventory', type: 'Method', version: 'v0.1', status: 'draft', visibility: 'internal', source: 'Current agency methodology', updated: '5 Aug 2026' },
    ],
    decisions: [
      { id: 'd-101', workspaceId: 'prohor', date: '1 Aug 2026', status: 'working', title: 'Use premium bookings as the north-star outcome', summary: 'Marketing and media activity should ultimately support qualified premium booking conversations.', reason: 'Reach alone does not show commercial movement.', owner: 'Strategy team' },
      { id: 'd-102', workspaceId: 'prohor', date: '1 Aug 2026', status: 'working', title: 'Treat listeners and booking buyers as separate audiences', summary: 'They are connected, but they need different messages, proof, and actions.', reason: 'A fan journey and a commercial buyer journey are not interchangeable.', owner: 'Strategy team' },
      { id: 'd-103', workspaceId: 'prohor', date: '1 Aug 2026', status: 'pending', title: 'Delay paid scaling until the organic path is measurable', summary: 'Build the destination, inquiry flow, and baseline learning loop first.', reason: 'Paid reach would amplify an unproven path.', owner: 'Growth lead' },
      { id: 'd-201', workspaceId: 'agency', date: '5 Aug 2026', status: 'approved', title: 'Keep methodology independent from AI providers', summary: 'Skills define the work; models are replaceable executors.', reason: 'The agency must own its process, quality rules, and memory.', owner: 'Agency team' },
      { id: 'd-202', workspaceId: 'agency', date: '5 Aug 2026', status: 'approved', title: 'Human review is required before client delivery', summary: 'AI outputs remain internal drafts until a responsible person approves visibility.', reason: 'Client trust and professional accountability cannot be delegated to a model.', owner: 'Agency team' },
    ],
    clientRequests: [
      { id: 'r-101', workspaceId: 'prohor', title: 'Approve positioning direction', detail: 'Confirm audience priority, promise, and brand boundaries.', status: 'waiting_client', due: 'Next check-in' },
      { id: 'r-102', workspaceId: 'prohor', title: 'Share three booking examples', detail: 'Event type, lead source, decision time, and result.', status: 'waiting_client', due: 'This week' },
      { id: 'r-103', workspaceId: 'prohor', title: 'Collect 5–10 performance clips', detail: 'Show venue quality, atmosphere, audience response, and presence.', status: 'in_progress', due: 'This week' },
      { id: 'r-104', workspaceId: 'prohor', title: 'Confirm filming capacity', detail: 'Realistic days, formats, editing support, and raw-material flow.', status: 'ready', due: 'Before media planning' },
    ],
    agentJobs: [
      { id: 'j-101', workspaceId: 'prohor', taskId: 't-105', skillId: 'awareness-map', title: 'Draft booking-buyer awareness map', model: 'Provider not selected', status: 'ready', context: ['Project summary', 'Client DNA draft', 'Research sources', 'Relevant decisions'], output: 'Awareness map artifact', review: 'Strategy lead' },
      { id: 'j-102', workspaceId: 'prohor', taskId: 't-103', skillId: 'offer-architecture', title: 'Build premium booking offer', model: 'Provider not selected', status: 'blocked', context: ['Approved positioning', 'Proof register', 'Booking examples'], output: 'Offer architecture artifact', review: 'Strategy lead' },
      { id: 'j-103', workspaceId: 'agency', taskId: 't-204', skillId: 'performance-analysis', title: 'Draft the agency learning review', model: 'Provider not selected', status: 'ready', context: ['Agency OS vision', 'Decision log', 'Existing analytics method'], output: 'Learning review template', review: 'Methodology owner' },
      { id: 'j-104', workspaceId: 'agency', taskId: 't-201', skillId: null, title: 'Normalize skill source inventory', model: 'Manual research first', status: 'queued', context: ['Methodology folders', 'Current prompts', 'Existing templates'], output: 'Skill inventory artifact', review: 'Methodology owner' },
    ],
  };

  const root = document.getElementById('agency-os-root');
  const workspaceFilter = document.querySelector('[data-os-workspace-filter]');
  const toast = document.getElementById('portal-toast');
  let activeTab = 'command';
  let activeWorkspace = 'all';
  let searchTerm = '';
  let toastTimer = null;
  let activeAuthContext = null;
  let state = hydrateState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readSavedState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY));
      return parsed?.version === STATE_VERSION ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function mergeRecords(seedRecords, savedRecords) {
    if (!Array.isArray(savedRecords)) return clone(seedRecords);
    const savedById = new Map(savedRecords.map((record) => [record.id, record]));
    const merged = seedRecords.map((record) => ({ ...clone(record), ...(savedById.get(record.id) || {}) }));
    savedRecords.forEach((record) => {
      if (!seedRecords.some((seedRecord) => seedRecord.id === record.id)) merged.push(record);
    });
    return merged;
  }

  function hydrateState(savedState = readSavedState()) {
    const saved = savedState;
    if (!saved) return clone(SEED);
    return {
      ...clone(SEED),
      tasks: mergeRecords(SEED.tasks, saved.tasks),
      artifacts: mergeRecords(SEED.artifacts, saved.artifacts),
      agentJobs: mergeRecords(SEED.agentJobs, saved.agentJobs),
    };
  }

  function saveState() {
    const savedState = {
      version: STATE_VERSION,
      tasks: state.tasks,
      artifacts: state.artifacts,
      agentJobs: state.agentJobs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.CABINET_DATA?.save('agency-os', activeAuthContext, savedState, { workspaceKey: 'agency' });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatLabel(value) {
    return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function workspaceName(id) {
    return state.workspaces.find((workspace) => workspace.id === id)?.name || id;
  }

  function domainName(id) {
    return state.domains.find((domain) => domain.id === id)?.name || id;
  }

  function skillName(id) {
    return state.skills.find((skill) => skill.id === id)?.name || 'No skill assigned';
  }

  function matchesWorkspace(record) {
    return activeWorkspace === 'all' || record.workspaceId === activeWorkspace || record.id === activeWorkspace;
  }

  function filtered(records) {
    return records.filter(matchesWorkspace);
  }

  function statusBadge(status) {
    return `<span class="agency-os-status agency-os-status--${escapeHtml(status)}">${escapeHtml(formatLabel(status))}</span>`;
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function renderMetric(label, value, note, attention = false) {
    return `
      <article class="agency-os-metric ${attention ? 'agency-os-metric--attention' : ''}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `;
  }

  function renderRow(title, detail, status, side = '') {
    return `
      <article class="agency-os-row">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(detail)}</small>
        </div>
        <div class="agency-os-row__side">
          ${status ? statusBadge(status) : ''}
          ${side ? `<small>${escapeHtml(side)}</small>` : ''}
        </div>
      </article>
    `;
  }

  function commandView() {
    const tasks = filtered(state.tasks);
    const requests = filtered(state.clientRequests);
    const artifacts = filtered(state.artifacts);
    const jobs = filtered(state.agentJobs);
    const workspaces = activeWorkspace === 'all'
      ? state.workspaces.filter((workspace) => workspace.id !== 'template')
      : state.workspaces.filter((workspace) => workspace.id === activeWorkspace);
    const blocked = tasks.filter((task) => task.status === 'blocked');
    const reviews = artifacts.filter((artifact) => artifact.status === 'ready_for_review');
    const waiting = requests.filter((request) => request.status === 'waiting_client');
    const readyJobs = jobs.filter((job) => job.status === 'ready');

    return `
      <div class="agency-os-metrics">
        ${renderMetric('Active workspaces', workspaces.length, 'Client and internal projects')}
        ${renderMetric('Needs a decision', reviews.length + tasks.filter((task) => task.status === 'review').length, 'Human review before work moves', true)}
        ${renderMetric('Waiting on clients', waiting.length, 'Inputs or approvals visible to clients')}
        ${renderMetric('Blocked work', blocked.length, 'Dependencies must be resolved')}
        ${renderMetric('AI-ready tasks', readyJobs.length, 'Portable handoffs, model not locked')}
      </div>

      <div class="agency-os-grid">
        <section class="agency-os-panel agency-os-panel--wide">
          <div class="agency-os-panel-heading">
            <div><span>Operating focus</span><h2>What needs attention now</h2></div>
            <strong>${reviews.length + blocked.length + waiting.length}</strong>
          </div>
          <div class="agency-os-list">
            ${reviews.slice(0, 3).map((artifact) => renderRow(artifact.title, `${workspaceName(artifact.workspaceId)} · ${artifact.type} ${artifact.version}`, artifact.status, 'Artifact')).join('')}
            ${blocked.slice(0, 3).map((task) => renderRow(task.title, `${workspaceName(task.workspaceId)} · blocked by a dependency`, task.status, task.assignee)).join('')}
            ${waiting.slice(0, 3).map((request) => renderRow(request.title, `${workspaceName(request.workspaceId)} · ${request.detail}`, request.status, request.due)).join('')}
            ${!reviews.length && !blocked.length && !waiting.length ? '<div class="agency-os-empty">Nothing needs immediate attention in this workspace.</div>' : ''}
          </div>
        </section>

        <section class="agency-os-panel agency-os-panel--narrow agency-os-panel--dark">
          <div class="agency-os-panel-heading">
            <div><span>Client side</span><h2>Inputs & approvals</h2></div>
            <strong>${requests.length}</strong>
          </div>
          <div class="agency-os-list">
            ${requests.slice(0, 4).map((request) => renderRow(request.title, request.detail, request.status, request.due)).join('') || '<div class="agency-os-empty">No client requests here.</div>'}
          </div>
        </section>

        <section class="agency-os-panel agency-os-panel--full">
          <div class="agency-os-panel-heading">
            <div><span>Live workspaces</span><h2>One system, different journeys</h2></div>
            <strong>${workspaces.length}</strong>
          </div>
          <div class="agency-os-card-grid">
            ${workspaces.map(renderWorkspaceCard).join('') || '<div class="agency-os-empty">Choose All workspaces to see the full portfolio.</div>'}
          </div>
        </section>

        <section class="agency-os-panel agency-os-panel--wide">
          <div class="agency-os-panel-heading">
            <div><span>Methodology in motion</span><h2>Pipeline status</h2></div>
            <strong>${filtered(state.pipelines).length}</strong>
          </div>
          <div class="agency-os-list">
            ${filtered(state.pipelines).map((pipeline) => {
              const done = pipeline.stages.filter((stage) => ['done', 'approved', 'complete'].includes(stage.status)).length;
              const active = pipeline.stages.find((stage) => ['active', 'in_progress', 'review', 'waiting_client', 'blocked'].includes(stage.status));
              return renderRow(pipeline.name, `${done}/${pipeline.stages.length} stages complete · next: ${active?.name || 'complete'}`, active?.status || 'complete', workspaceName(pipeline.workspaceId));
            }).join('') || '<div class="agency-os-empty">No pipelines match this workspace.</div>'}
          </div>
        </section>

        <section class="agency-os-panel agency-os-panel--narrow">
          <div class="agency-os-panel-heading">
            <div><span>Agent handoff</span><h2>Ready to execute</h2></div>
            <strong>${readyJobs.length}</strong>
          </div>
          <div class="agency-os-list">
            ${readyJobs.map((job) => renderRow(job.title, `${skillName(job.skillId)} · review: ${job.review}`, job.status, workspaceName(job.workspaceId))).join('') || '<div class="agency-os-empty">No AI-ready tasks in this workspace.</div>'}
          </div>
        </section>

        <section class="agency-os-panel agency-os-panel--full agency-os-panel--dark">
          <div class="agency-os-panel-heading">
            <div><span>No-regrets foundation</span><h2>What this prototype already separates</h2></div>
            <strong>4</strong>
          </div>
          <div class="agency-os-readiness">
            <article><span>Method</span><strong>Skills own the process</strong><small>Instructions and quality gates do not depend on a model.</small></article>
            <article><span>Execution</span><strong>Tasks own the work</strong><small>Human, client, or AI can be the executor with the same contract.</small></article>
            <article><span>Memory</span><strong>Artifacts and decisions persist</strong><small>Results, reasons, sources, and versions stay addressable.</small></article>
            <article><span>Visibility</span><strong>Client delivery is explicit</strong><small>Internal drafts do not become client-visible without review.</small></article>
          </div>
        </section>
      </div>
    `;
  }

  function renderWorkspaceCard(workspace) {
    const action = workspace.cabinetId
      ? `<button class="${workspace.id === 'template' ? 'secondary-button' : 'primary-button'}" type="button" data-admin-client="${escapeHtml(workspace.cabinetId)}">${workspace.id === 'template' ? 'Preview template' : 'Open client cabinet'} <span>→</span></button>`
      : '<button class="secondary-button" type="button" data-os-tab-jump="command">Open internal command center</button>';
    return `
      <article class="agency-os-card ${workspace.id === 'template' ? 'agency-os-card--template' : ''}">
        <div class="agency-os-card-head">
          <span class="agency-os-avatar">${escapeHtml(workspace.initials)}</span>
          ${statusBadge(workspace.health)}
        </div>
        <h3>${escapeHtml(workspace.name)}</h3>
        <p>${escapeHtml(workspace.summary)}</p>
        <div class="agency-os-progress">
          <div class="agency-os-progress__copy"><span>${escapeHtml(workspace.phase)}</span><strong>${escapeHtml(workspace.progress)}%</strong></div>
          <div class="agency-os-progress__track"><span style="width: ${Math.max(0, Math.min(100, Number(workspace.progress)))}%"></span></div>
        </div>
        ${action}
      </article>
    `;
  }

  function workspacesView() {
    const visible = activeWorkspace === 'all'
      ? state.workspaces
      : state.workspaces.filter((workspace) => workspace.id === activeWorkspace);
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Company → workspace</span><h2>Client and internal workspaces</h2></div>
        <p>Each workspace owns its operational state. The client portal is a filtered view of the same project, not a separately maintained page.</p>
      </div>
      <div class="agency-os-card-grid">${visible.map(renderWorkspaceCard).join('')}</div>
      <article class="strategy-method-note">
        <span class="future-panel__index">Rule</span>
        <div><span class="section-kicker">Reusable by design</span><h2>Template → real workspace → domains → pipelines → deliverables</h2><p>A new client receives the shared structure, then only its own records, permissions, files, decisions, and progress.</p></div>
      </article>
    `;
  }

  function pipelinesView() {
    const pipelines = filtered(state.pipelines);
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Method in sequence</span><h2>Reusable pipelines</h2></div>
        <p>The agency defines the order and dependencies. An AI model only performs a bounded task inside a stage.</p>
      </div>
      <div class="agency-os-pipeline-list">
        ${pipelines.map((pipeline) => `
          <article class="agency-os-pipeline">
            <div class="agency-os-pipeline__head">
              <div>
                <span class="agency-os-chip">${escapeHtml(domainName(pipeline.domainId))} · ${escapeHtml(workspaceName(pipeline.workspaceId))}</span>
                <h2>${escapeHtml(pipeline.name)}</h2>
                <p>${escapeHtml(pipeline.purpose)}</p>
              </div>
              <span class="agency-os-badge">${escapeHtml(pipeline.version)}</span>
            </div>
            <div class="agency-os-stages">
              ${pipeline.stages.map((stage, index) => `
                <article class="agency-os-stage">
                  <div class="agency-os-stage-head"><span class="agency-os-chip">${String(index + 1).padStart(2, '0')}</span>${statusBadge(stage.status)}</div>
                  <h3>${escapeHtml(stage.name)}</h3>
                  <p>${escapeHtml(stage.skillId ? skillName(stage.skillId) : 'Human decision or operational gate')}</p>
                  <div class="agency-os-stage-foot"><span>${stage.skillId ? 'Skill' : 'Gate'}</span><strong>${escapeHtml(formatLabel(stage.status))}</strong></div>
                </article>
              `).join('')}
            </div>
          </article>
        `).join('') || '<div class="agency-os-empty">No pipelines match this workspace.</div>'}
      </div>
    `;
  }

  function skillsView() {
    const term = searchTerm.toLowerCase();
    const skills = state.skills.filter((skill) => !term || [skill.name, skill.category, skill.goal, skill.output].join(' ').toLowerCase().includes(term));
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Agency intellectual property</span><h2>Marketing skill library</h2></div>
        <p>Versioned, model-independent definitions of how the agency performs and reviews important work.</p>
      </div>
      <div class="agency-os-skill-toolbar">
        <input class="agency-os-search" type="search" data-os-skill-search value="${escapeHtml(searchTerm)}" placeholder="Search skills, outputs, or categories…" aria-label="Search marketing skills">
        <span class="agency-os-badge">${skills.length} of ${state.skills.length} skills</span>
      </div>
      <div class="agency-os-skill-grid">
        ${skills.map((skill) => `
          <article class="agency-os-skill">
            <div class="agency-os-card-head"><span class="agency-os-chip">${escapeHtml(skill.number)} · ${escapeHtml(skill.category)}</span><span class="agency-os-badge">${escapeHtml(skill.version)}</span></div>
            <h3>${escapeHtml(skill.name)}</h3>
            <p>${escapeHtml(skill.goal)}</p>
            <div class="agency-os-skill__io">
              <div><span>Inputs</span><strong>${escapeHtml(skill.input)}</strong></div>
              <div><span>Output</span><strong>${escapeHtml(skill.output)}</strong></div>
              <div><span>Quality gate</span><strong>${escapeHtml(skill.quality)}</strong></div>
            </div>
            <div class="agency-os-skill-foot"><span>Portable to any approved agent</span><strong>Human review</strong></div>
          </article>
        `).join('') || '<div class="agency-os-empty">No skills match this search.</div>'}
      </div>
    `;
  }

  function tasksView() {
    const tasks = filtered(state.tasks);
    const groups = [
      { label: 'Ready', statuses: ['ready'] },
      { label: 'In progress', statuses: ['in_progress'] },
      { label: 'Review / client', statuses: ['review', 'waiting_client'] },
      { label: 'Blocked', statuses: ['blocked'] },
      { label: 'Done', statuses: ['done'] },
    ];
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Shared work queue</span><h2>Human, client, and AI tasks</h2></div>
        <p>Every task carries a workspace, domain, skill, assignee type, visibility, dependency state, and expected outcome.</p>
      </div>
      <div class="agency-os-task-toolbar">
        <span class="agency-os-badge">${tasks.length} tasks in view</span>
        <button class="secondary-button" type="button" data-os-new-task>Add task</button>
      </div>
      <div class="agency-os-board">
        ${groups.map((group) => {
          const groupTasks = tasks.filter((task) => group.statuses.includes(task.status));
          return `
            <section class="agency-os-board-column">
              <div class="agency-os-board-column__head"><strong>${escapeHtml(group.label)}</strong><span>${groupTasks.length}</span></div>
              <div class="agency-os-task-stack">
                ${groupTasks.map((task) => `
                  <article class="agency-os-task">
                    <div class="agency-os-task-meta"><span>${escapeHtml(domainName(task.domainId))}</span><span>${escapeHtml(task.priority)}</span></div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <p>${escapeHtml(task.description)}</p>
                    <div class="agency-os-task-meta"><span>${escapeHtml(task.assigneeType)} · ${escapeHtml(task.assignee)}</span><span>${escapeHtml(task.due)}</span></div>
                    <select data-os-task-status="${escapeHtml(task.id)}" aria-label="Change status for ${escapeHtml(task.title)}">
                      ${TASK_STATUSES.map((status) => `<option value="${status}" ${task.status === status ? 'selected' : ''}>${escapeHtml(formatLabel(status))}</option>`).join('')}
                    </select>
                  </article>
                `).join('') || '<div class="agency-os-empty">No tasks</div>'}
              </div>
            </section>
          `;
        }).join('')}
      </div>
    `;
  }

  function artifactsView() {
    const artifacts = filtered(state.artifacts);
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Structured results</span><h2>Artifact registry</h2></div>
        <p>Chats are temporary. Each meaningful task creates or updates a versioned artifact with sources, status, and visibility.</p>
      </div>
      <div class="agency-os-artifact-grid">
        ${artifacts.map((artifact) => `
          <article class="agency-os-artifact">
            <div class="agency-os-card-head"><span class="agency-os-artifact__type">${escapeHtml(artifact.type.slice(0, 3).toUpperCase())}</span>${statusBadge(artifact.status)}</div>
            <h3>${escapeHtml(artifact.title)}</h3>
            <p>${escapeHtml(workspaceName(artifact.workspaceId))} · ${escapeHtml(domainName(artifact.domainId))}</p>
            <div class="agency-os-artifact__meta">
              <span><em>Version</em><strong>${escapeHtml(artifact.version)}</strong></span>
              <span><em>Source</em><strong>${escapeHtml(artifact.source)}</strong></span>
              <span><em>Updated</em><strong>${escapeHtml(artifact.updated)}</strong></span>
            </div>
            <div class="agency-os-artifact-foot">
              <span class="agency-os-visibility">${artifact.visibility === 'client' ? 'Client delivery' : 'Internal only'}</span>
              <button type="button" data-os-toggle-visibility="${escapeHtml(artifact.id)}">${artifact.visibility === 'client' ? 'Make internal' : 'Mark delivery'}</button>
            </div>
          </article>
        `).join('') || '<div class="agency-os-empty">No artifacts match this workspace.</div>'}
      </div>
    `;
  }

  function decisionsView() {
    const decisions = filtered(state.decisions);
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Project memory</span><h2>Decision log</h2></div>
        <p>Future teammates and agents need the reason behind a decision, not only the latest final document.</p>
      </div>
      <section class="agency-os-panel agency-os-panel--full">
        <div class="agency-os-timeline">
          ${decisions.map((decision) => `
            <article class="agency-os-decision">
              <div><time>${escapeHtml(decision.date)}</time><div>${statusBadge(decision.status)}</div></div>
              <div><small>${escapeHtml(workspaceName(decision.workspaceId))}</small><h3>${escapeHtml(decision.title)}</h3><p>${escapeHtml(decision.summary)}</p></div>
              <aside class="agency-os-decision__reason"><strong>Why</strong><small>${escapeHtml(decision.reason)}</small><strong>Owner</strong><small>${escapeHtml(decision.owner)}</small></aside>
            </article>
          `).join('') || '<div class="agency-os-empty">No decisions match this workspace.</div>'}
        </div>
      </section>
    `;
  }

  function agentsView() {
    const jobs = filtered(state.agentJobs);
    return `
      <div class="agency-os-section-heading">
        <div><span class="section-kicker">Manual first, automated later</span><h2>AI execution queue</h2></div>
        <p>Download a complete, model-neutral task handoff. The selected agent returns an artifact for human review; it never publishes directly to the client.</p>
      </div>
      <div class="agency-os-agent-list">
        ${jobs.map((job) => `
          <article class="agency-os-agent">
            <div>
              <div class="agency-os-card-head"><span class="agency-os-chip">${escapeHtml(workspaceName(job.workspaceId))}</span>${statusBadge(job.status)}</div>
              <h3>${escapeHtml(job.title)}</h3>
              <p>${escapeHtml(skillName(job.skillId))} → ${escapeHtml(job.output)}</p>
            </div>
            <div class="agency-os-agent__context">
              <strong>Context pack</strong>
              ${job.context.map((item) => `<span>• ${escapeHtml(item)}</span>`).join('')}
            </div>
            <div class="agency-os-agent__action">
              <span class="agency-os-badge">Review: ${escapeHtml(job.review)}</span>
              <button type="button" data-os-download-handoff="${escapeHtml(job.id)}">Download agent handoff</button>
            </div>
          </article>
        `).join('') || '<div class="agency-os-empty">No agent jobs match this workspace.</div>'}
      </div>
      <article class="strategy-method-note">
        <span class="future-panel__index">API</span>
        <div><span class="section-kicker">Stable boundary</span><h2>Task + skill + context + output contract + review gate</h2><p>This handoff can be used manually with Codex, Claude, Hermes, or another agent today. A queue worker can automate the same contract later without changing the methodology.</p></div>
      </article>
    `;
  }

  function render() {
    if (!root) return;
    const views = {
      command: commandView,
      workspaces: workspacesView,
      pipelines: pipelinesView,
      skills: skillsView,
      tasks: tasksView,
      artifacts: artifactsView,
      decisions: decisionsView,
      agents: agentsView,
    };
    root.innerHTML = (views[activeTab] || commandView)();
    document.querySelectorAll('[data-os-tab]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.osTab === activeTab);
    });
  }

  function createTaskDialog() {
    if (document.getElementById('agency-os-task-dialog')) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'agency-os-dialog';
    dialog.id = 'agency-os-task-dialog';
    dialog.innerHTML = `
      <form method="dialog" data-os-task-form>
        <div class="agency-os-dialog__head">
          <div><span class="section-kicker">Operating task</span><h2>Create a work item</h2></div>
          <button class="agency-os-dialog__close" type="button" data-os-close-dialog aria-label="Close">×</button>
        </div>
        <label>Task title<input name="title" required maxlength="120" placeholder="A clear outcome, not a vague activity"></label>
        <label>Description<textarea name="description" required maxlength="500" placeholder="Context, expected result, and important constraints"></textarea></label>
        <div class="agency-os-dialog__grid">
          <label>Workspace<select name="workspaceId">${state.workspaces.filter((workspace) => workspace.id !== 'template').map((workspace) => `<option value="${escapeHtml(workspace.id)}">${escapeHtml(workspace.name)}</option>`).join('')}</select></label>
          <label>Domain<select name="domainId">${state.domains.map((domain) => `<option value="${escapeHtml(domain.id)}">${escapeHtml(domain.name)}</option>`).join('')}</select></label>
          <label>Executor<select name="assigneeType"><option value="human">Human</option><option value="client">Client</option><option value="agent">AI agent</option></select></label>
          <label>Skill<select name="skillId"><option value="">No skill yet</option>${state.skills.map((skill) => `<option value="${escapeHtml(skill.id)}">${escapeHtml(skill.name)}</option>`).join('')}</select></label>
          <label>Priority<select name="priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></label>
          <label>Initial status<select name="status">${TASK_STATUSES.filter((status) => status !== 'done').map((status) => `<option value="${status}">${escapeHtml(formatLabel(status))}</option>`).join('')}</select></label>
        </div>
        <div class="agency-os-dialog__foot"><button class="secondary-button" type="button" data-os-close-dialog>Cancel</button><button class="primary-button" type="submit">Create task</button></div>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector('[data-os-task-form]').addEventListener('submit', saveNewTask);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function openTaskDialog() {
    const dialog = document.getElementById('agency-os-task-dialog');
    if (!dialog) return;
    const workspaceSelect = dialog.querySelector('[name="workspaceId"]');
    if (activeWorkspace !== 'all' && activeWorkspace !== 'template') workspaceSelect.value = activeWorkspace;
    dialog.showModal();
    dialog.querySelector('[name="title"]').focus();
  }

  function saveNewTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const workspaceId = String(data.get('workspaceId'));
    const assigneeType = String(data.get('assigneeType'));
    state.tasks.unshift({
      id: `custom-${Date.now()}`,
      workspaceId,
      domainId: String(data.get('domainId')),
      skillId: String(data.get('skillId')) || null,
      title: String(data.get('title')).trim(),
      description: String(data.get('description')).trim(),
      assigneeType,
      assignee: assigneeType === 'client' ? workspaceName(workspaceId) : assigneeType === 'agent' ? 'Unassigned AI' : 'Unassigned team member',
      status: String(data.get('status')),
      priority: String(data.get('priority')),
      due: 'Not scheduled',
      clientVisible: assigneeType === 'client',
    });
    saveState();
    form.reset();
    document.getElementById('agency-os-task-dialog').close();
    activeTab = 'tasks';
    render();
    showToast('Task created.');
  }

  function updateTaskStatus(taskId, status) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || !TASK_STATUSES.includes(status)) return;
    task.status = status;
    saveState();
    render();
    showToast(`Task moved to ${formatLabel(status)}.`);
  }

  function toggleArtifactVisibility(artifactId) {
    const artifact = state.artifacts.find((item) => item.id === artifactId);
    if (!artifact) return;
    artifact.visibility = artifact.visibility === 'client' ? 'internal' : 'client';
    saveState();
    render();
    showToast(artifact.visibility === 'client' ? 'Artifact marked for client delivery.' : 'Artifact returned to internal visibility.');
  }

  function buildAgentHandoff(job) {
    const task = state.tasks.find((item) => item.id === job.taskId);
    const skill = state.skills.find((item) => item.id === job.skillId) || null;
    const decisions = state.decisions.filter((decision) => decision.workspaceId === job.workspaceId);
    const artifacts = state.artifacts.filter((artifact) => artifact.workspaceId === job.workspaceId);
    return {
      protocol: 'cabinet.agent-handoff',
      protocolVersion: '1.0',
      createdAt: new Date().toISOString(),
      executionPolicy: {
        providerIndependent: true,
        clientPublicationAllowed: false,
        humanReviewRequired: true,
        dataRule: 'Use only the supplied context and explicitly cited sources. Label unknowns and assumptions.',
      },
      workspace: {
        id: job.workspaceId,
        name: workspaceName(job.workspaceId),
      },
      task,
      skill,
      contextPack: {
        requestedBlocks: job.context,
        relevantDecisions: decisions,
        availableArtifacts: artifacts.map(({ id, title, type, version, status, visibility, source }) => ({ id, title, type, version, status, visibility, source })),
      },
      expectedOutput: {
        artifactType: job.output,
        initialVisibility: 'internal',
        reviewer: job.review,
        include: ['result', 'sources used', 'assumptions', 'open questions', 'recommended next action'],
      },
      returnContract: {
        taskStatus: 'review',
        createArtifactVersion: true,
        appendActivityLog: true,
        neverOverwriteApprovedVersion: true,
      },
    };
  }

  function downloadAgentHandoff(jobId) {
    const job = state.agentJobs.find((item) => item.id === jobId);
    if (!job) return;
    const handoff = buildAgentHandoff(job);
    const blob = new Blob([JSON.stringify(handoff, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${job.id}-${job.skillId || 'manual'}-handoff.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    job.status = job.status === 'ready' ? 'prepared' : job.status;
    saveState();
    render();
    showToast('Agent handoff downloaded. It is ready for any approved model.');
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const tabButton = event.target.closest('[data-os-tab], [data-os-tab-jump]');
      if (tabButton) {
        activeTab = tabButton.dataset.osTab || tabButton.dataset.osTabJump;
        searchTerm = '';
        render();
        root?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (event.target.closest('[data-os-new-task]')) {
        openTaskDialog();
        return;
      }

      const visibility = event.target.closest('[data-os-toggle-visibility]');
      if (visibility) {
        toggleArtifactVisibility(visibility.dataset.osToggleVisibility);
        return;
      }

      const handoff = event.target.closest('[data-os-download-handoff]');
      if (handoff) {
        downloadAgentHandoff(handoff.dataset.osDownloadHandoff);
        return;
      }

      if (event.target.closest('[data-os-close-dialog]')) {
        document.getElementById('agency-os-task-dialog')?.close();
      }
    });

    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-os-workspace-filter]')) {
        activeWorkspace = event.target.value;
        render();
        return;
      }
      if (event.target.matches('[data-os-task-status]')) {
        updateTaskStatus(event.target.dataset.osTaskStatus, event.target.value);
      }
    });

    document.addEventListener('input', (event) => {
      if (!event.target.matches('[data-os-skill-search]')) return;
      searchTerm = event.target.value;
      render();
      const input = document.querySelector('[data-os-skill-search]');
      input?.focus();
      input?.setSelectionRange(searchTerm.length, searchTerm.length);
    });
  }

  async function init() {
    if (!root) return;
    const authContext = await (window.CLIENT_SPACE_AUTH_READY || Promise.resolve({ isAdmin: false }));
    if (!authContext?.isAdmin) return;
    activeAuthContext = authContext;
    if (window.CABINET_DATA) {
      const result = await window.CABINET_DATA.load('agency-os', authContext, {
        workspaceKey: 'agency',
        fallback: readSavedState(),
      });
      state = hydrateState(result.value);
    }
    createTaskDialog();
    bindEvents();
    if (workspaceFilter) workspaceFilter.value = activeWorkspace;
    render();
  }

  init();
})();
