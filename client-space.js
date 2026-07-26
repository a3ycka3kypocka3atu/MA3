(function () {
  'use strict';

  const CLIENTS = {
    prohor: {
      id: 'prohor',
      name: 'Prohor Music',
      contactName: 'Prohor',
      initials: 'PM',
      currentPhase: 'Research & foundation',
      progress: 42,
      nextCheckin: 'To be scheduled',
      latestUpdate: {
        date: '26 July 2026',
        title: 'We are organizing the strategy foundation',
        copy: 'Your intake structure is ready. The next step is collecting the strongest proof, story, and content inputs before we shape the positioning.',
      },
      roadmap: [
        {
          title: 'Discovery & intake',
          description: 'Collect the business context, artist story, goals, available proof, and current booking process.',
          status: 'done',
          timing: 'Completed',
        },
        {
          title: 'Research & foundation',
          description: 'Organize the inputs, review the market, and define the strongest strategic direction.',
          status: 'active',
          timing: 'Active now',
        },
        {
          title: 'Positioning & offer',
          description: 'Shape the core narrative, premium offer logic, audiences, and reasons to believe.',
          status: 'upcoming',
          timing: 'Up next',
        },
        {
          title: 'Content & media system',
          description: 'Turn the strategy into content pillars, formats, proof, and a repeatable production rhythm.',
          status: 'upcoming',
          timing: 'Planned',
        },
        {
          title: 'Launch & optimization',
          description: 'Put the system into action, track the response, and improve what creates real demand.',
          status: 'upcoming',
          timing: 'Planned',
        },
      ],
      updates: [
        {
          date: '26 Jul 2026',
          title: 'Client workspace prototype created',
          copy: 'The project can now grow into one shared home for tasks, materials, forms, and progress.',
        },
        {
          date: '24 Jul 2026',
          title: 'Intake flow prepared',
          copy: 'Questions were grouped around operations, content, story, assets, and media strategy.',
        },
        {
          date: '22 Jul 2026',
          title: 'Project foundation reviewed',
          copy: 'We outlined the information needed before positioning and creative work begins.',
        },
      ],
      tasks: [
        {
          id: 'complete-intake',
          title: 'Complete the artist strategy intake',
          description: 'Answer each block so we can build the strategy from real context instead of assumptions.',
          category: 'Questionnaire',
          effort: '20–30 min',
          priority: 'High priority',
          featured: true,
        },
        {
          id: 'collect-footage',
          title: 'Collect 5–10 strong performance clips',
          description: 'Choose moments that show atmosphere, audience response, venue quality, and your presence.',
          category: 'Content',
          effort: '30 min',
          priority: 'This week',
          featured: true,
        },
        {
          id: 'booking-examples',
          title: 'Share three recent booking examples',
          description: 'Add the event type, how the lead arrived, the decision time, and the final result.',
          category: 'Strategy input',
          effort: '15 min',
          priority: 'This week',
          featured: true,
        },
        {
          id: 'epk-assets',
          title: 'Gather current EPK and press assets',
          description: 'Put the biography, photos, logos, mixes, press mentions, and technical information in one folder.',
          category: 'Materials',
          effort: '25 min',
          priority: 'Next',
        },
        {
          id: 'reference-artists',
          title: 'Select three useful artist references',
          description: 'Choose references for positioning, content, or visual presentation and explain what feels relevant.',
          category: 'Creative direction',
          effort: '15 min',
          priority: 'Next',
        },
      ],
      materials: [
        {
          type: 'DOC',
          style: 'document',
          title: 'Project direction summary',
          description: 'A short view of the project goals, current questions, and proposed strategic path.',
          status: 'ready',
          meta: 'Team material',
          action: 'Preview soon',
        },
        {
          type: 'INPUT',
          style: 'input',
          title: 'Performance video folder',
          description: 'Raw clips from events, backstage, studio sessions, and travel moments.',
          status: 'waiting',
          meta: 'Client input',
          action: 'Waiting for files',
        },
        {
          type: 'EPK',
          style: 'input',
          title: 'Current artist assets',
          description: 'Biography, press photos, logos, mixes, tech rider, and press mentions.',
          status: 'waiting',
          meta: 'Client input',
          action: 'Waiting for files',
        },
        {
          type: 'LINK',
          style: 'link',
          title: 'Reference collection',
          description: 'Artist, campaign, content, and visual references connected to this project.',
          status: 'ready',
          meta: 'Shared reference',
          action: 'Preview soon',
        },
        {
          type: 'PLAN',
          style: 'document',
          title: 'Strategy roadmap',
          description: 'The sequence from discovery through positioning, content system, and launch.',
          status: 'ready',
          meta: 'Team material',
          action: 'View in Progress',
          targetView: 'progress',
        },
        {
          type: 'NOTES',
          style: 'document',
          title: 'Meeting notes',
          description: 'Decisions, open questions, and next actions from project check-ins.',
          status: 'ready',
          meta: 'Shared notes',
          action: 'Preview soon',
        },
      ],
      knowledge: [
        {
          id: 'positioning',
          category: 'Strategy',
          duration: '5 min',
          title: 'Positioning is a choice, not a slogan',
          description: 'How choosing the right audience, context, and promise makes every later marketing decision easier.',
          intro: 'Strong positioning makes you easier to understand, remember, and choose. It is the strategic choice behind your language—not a clever sentence added at the end.',
          steps: [
            ['Choose the context', 'Decide which type of opportunity, audience, or market situation matters most right now.'],
            ['Name the value', 'Translate what you do into the change or experience the right client cares about.'],
            ['Build proof', 'Support the promise with real venues, reactions, outcomes, process, and credible signals.'],
          ],
        },
        {
          id: 'proof',
          category: 'Marketing',
          duration: '4 min',
          title: 'Proof before promotion',
          description: 'Why raw evidence from real work often creates more trust than polished claims.',
          intro: 'People believe what they can see. Useful marketing captures evidence from the work and turns it into clear signals of quality, relevance, and momentum.',
          steps: [
            ['Capture the moment', 'Save audience reactions, venue context, preparation, and the detail behind the performance.'],
            ['Add meaning', 'Explain why the moment matters instead of posting an isolated visual.'],
            ['Connect to action', 'Make it clear what type of booking or conversation this proof supports.'],
          ],
        },
        {
          id: 'content-system',
          category: 'Content',
          duration: '7 min',
          title: 'Build a content system, not a posting habit',
          description: 'A repeatable method for turning real project activity into useful, varied content.',
          intro: 'A content system reduces the pressure to invent ideas every week. It starts with recurring inputs, clear roles, and a few formats that can be repeated.',
          steps: [
            ['Define the raw inputs', 'Performances, preparation, travel, studio work, audience questions, and project milestones.'],
            ['Create repeatable formats', 'Use a small set of formats for proof, personality, expertise, and conversion.'],
            ['Review what moves people', 'Track meaningful response and improve the formats that attract the right opportunities.'],
          ],
        },
        {
          id: 'marketing-system',
          category: 'Foundation',
          duration: '6 min',
          title: 'From attention to booking: your simple marketing system',
          description: 'How positioning, proof, content, and calls to action connect into a client journey.',
          intro: 'Marketing works better as a connected journey. Attention starts the relationship, proof lowers uncertainty, and a clear next step turns interest into a real conversation.',
          steps: [
            ['Attention', 'Create a recognizable point of view or moment that is relevant to the opportunities you want.'],
            ['Trust', 'Use story, consistent presentation, and real proof so the right client understands the quality.'],
            ['Action', 'Offer one obvious next step with the information needed to begin a booking conversation.'],
          ],
        },
      ],
      forms: [
        {
          title: 'Artist strategy intake',
          description: 'Booking, content, story, EPK, and media strategy inputs for the project foundation.',
          status: 'active',
          timing: 'Approx. 25 min',
          href: 'prohor-intake.html',
          featured: true,
        },
        {
          title: 'Content asset review',
          description: 'A future form for reviewing footage, selecting strong moments, and recording usage notes.',
          status: 'draft',
          timing: 'Coming later',
        },
        {
          title: 'Strategy feedback',
          description: 'A future structured review for decisions, comments, and approval after the first strategy version.',
          status: 'draft',
          timing: 'Coming later',
        },
      ],
    },
  };

  const queryClient = new URLSearchParams(window.location.search).get('client');
  const client = CLIENTS[queryClient] || CLIENTS.prohor;
  const taskStorageKey = `34forfree7:client-space:${client.id}:tasks:v1`;
  const questionStorageKey = `34forfree7:client-space:${client.id}:questions:v1`;

  let completedTasks = readJson(taskStorageKey, []);
  let savedQuestions = readJson(questionStorageKey, []);
  let activeTaskFilter = 'all';
  let toastTimer = null;

  const dom = {
    body: document.body,
    sidebar: document.getElementById('sidebar'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileBackdrop: document.getElementById('mobile-backdrop'),
    currentViewLabel: document.getElementById('current-view-label'),
    projectProgressValue: document.getElementById('project-progress-value'),
    roadmapProgressValue: document.getElementById('roadmap-progress-value'),
    overviewOpenTasks: document.getElementById('overview-open-tasks'),
    overviewMaterialCount: document.getElementById('overview-material-count'),
    sidebarTaskCount: document.getElementById('sidebar-task-count'),
    overviewTaskList: document.getElementById('overview-task-list'),
    fullTaskList: document.getElementById('full-task-list'),
    taskCompletionRatio: document.getElementById('task-completion-ratio'),
    roadmapList: document.getElementById('roadmap-list'),
    activityTimeline: document.getElementById('activity-timeline'),
    materialGrid: document.getElementById('material-grid'),
    materialTotalCount: document.getElementById('material-total-count'),
    materialReadyCount: document.getElementById('material-ready-count'),
    materialWaitingCount: document.getElementById('material-waiting-count'),
    overviewKnowledgeList: document.getElementById('overview-knowledge-list'),
    knowledgeGrid: document.getElementById('knowledge-grid'),
    formsGrid: document.getElementById('forms-grid'),
    questionForm: document.getElementById('question-form'),
    savedQuestionList: document.getElementById('saved-question-list'),
    savedQuestionCount: document.getElementById('saved-question-count'),
    articleDialog: document.getElementById('article-dialog'),
    articleDialogContent: document.getElementById('article-dialog-content'),
    dialogClose: document.getElementById('dialog-close'),
    toast: document.getElementById('portal-toast'),
  };

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applyClientContent() {
    document.querySelectorAll('[data-client-name]').forEach((element) => {
      element.textContent = client.name;
    });
    document.querySelectorAll('[data-client-contact]').forEach((element) => {
      element.textContent = client.contactName;
    });
    document.querySelectorAll('[data-client-initials]').forEach((element) => {
      element.textContent = client.initials;
    });
    document.querySelectorAll('[data-current-phase]').forEach((element) => {
      element.textContent = client.currentPhase;
    });
    document.querySelectorAll('[data-next-checkin]').forEach((element) => {
      element.textContent = client.nextCheckin;
    });
    document.querySelectorAll('[data-latest-update-date]').forEach((element) => {
      element.textContent = client.latestUpdate.date;
    });
    document.querySelectorAll('[data-latest-update-title]').forEach((element) => {
      element.textContent = client.latestUpdate.title;
    });
    document.querySelectorAll('[data-latest-update-copy]').forEach((element) => {
      element.textContent = client.latestUpdate.copy;
    });

    dom.projectProgressValue.textContent = `${client.progress}%`;
    dom.roadmapProgressValue.textContent = `${client.progress}%`;

    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    document.getElementById('day-period').textContent = period;
    document.title = `${client.name} Client Space — 34ForFree7`;
  }

  function switchView(viewName) {
    const targetView = document.querySelector(`[data-view="${viewName}"]`);
    if (!targetView) return;

    document.querySelectorAll('[data-view]').forEach((view) => {
      view.classList.toggle('is-active', view === targetView);
    });
    document.querySelectorAll('[data-view-target]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.viewTarget === viewName);
    });

    const label = document.querySelector(`[data-view-target="${viewName}"] span:nth-child(2)`);
    dom.currentViewLabel.textContent = label ? label.textContent : 'Client Space';
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.hash = viewName === 'overview' ? '' : viewName;
      window.history.replaceState({}, '', url);
    }
  }

  function openMobileMenu() {
    dom.body.classList.add('menu-open');
    dom.mobileMenu.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    dom.body.classList.remove('menu-open');
    dom.mobileMenu.setAttribute('aria-expanded', 'false');
  }

  function isTaskDone(id) {
    return completedTasks.includes(id);
  }

  function toggleTask(id, isDone) {
    if (isDone && !completedTasks.includes(id)) {
      completedTasks.push(id);
    } else if (!isDone) {
      completedTasks = completedTasks.filter((taskId) => taskId !== id);
    }
    localStorage.setItem(taskStorageKey, JSON.stringify(completedTasks));
    renderTasks();
    showToast(isDone ? 'Task completed. Nice progress.' : 'Task moved back to open.');
  }

  function taskCheckbox(task) {
    return `
      <input
        class="task-checkbox"
        type="checkbox"
        data-task-checkbox="${escapeHtml(task.id)}"
        aria-label="Mark ${escapeHtml(task.title)} as completed"
        ${isTaskDone(task.id) ? 'checked' : ''}
      >
    `;
  }

  function renderTasks() {
    const openTasks = client.tasks.filter((task) => !isTaskDone(task.id));
    const featured = [...openTasks.filter((task) => task.featured), ...openTasks.filter((task) => !task.featured)].slice(0, 3);
    const overviewTasks = featured.length ? featured : client.tasks.slice(0, 3);

    dom.overviewTaskList.innerHTML = overviewTasks.map((task) => `
      <article class="compact-task ${isTaskDone(task.id) ? 'is-done' : ''}">
        ${taskCheckbox(task)}
        <div class="compact-task__copy">
          <strong>${escapeHtml(task.title)}</strong>
          <span>${escapeHtml(task.effort)} · ${escapeHtml(task.category)}</span>
        </div>
        <span class="task-status">${isTaskDone(task.id) ? 'Done' : escapeHtml(task.priority)}</span>
      </article>
    `).join('');

    const filteredTasks = client.tasks.filter((task) => {
      if (activeTaskFilter === 'open') return !isTaskDone(task.id);
      if (activeTaskFilter === 'done') return isTaskDone(task.id);
      return true;
    });

    dom.fullTaskList.innerHTML = filteredTasks.length
      ? filteredTasks.map((task) => `
          <article class="full-task ${isTaskDone(task.id) ? 'is-done' : ''}">
            ${taskCheckbox(task)}
            <div class="full-task__main">
              <h2>${escapeHtml(task.title)}</h2>
              <p>${escapeHtml(task.description)}</p>
              <div class="full-task__meta">
                <span class="meta-chip">${escapeHtml(task.category)}</span>
                <span class="meta-chip">${escapeHtml(task.effort)}</span>
              </div>
            </div>
            <span class="task-status">${isTaskDone(task.id) ? 'Completed' : escapeHtml(task.priority)}</span>
          </article>
        `).join('')
      : '<div class="empty-state">No tasks match this filter.</div>';

    dom.overviewOpenTasks.textContent = openTasks.length;
    dom.sidebarTaskCount.textContent = openTasks.length;
    dom.taskCompletionRatio.textContent = `${completedTasks.filter((id) => client.tasks.some((task) => task.id === id)).length} / ${client.tasks.length}`;

    document.querySelectorAll('[data-task-checkbox]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => toggleTask(checkbox.dataset.taskCheckbox, checkbox.checked));
    });
  }

  function renderRoadmap() {
    dom.roadmapList.innerHTML = client.roadmap.map((item, index) => `
      <article class="roadmap-item is-${escapeHtml(item.status)}">
        <span class="roadmap-index">${item.status === 'done' ? '✓' : String(index + 1).padStart(2, '0')}</span>
        <div class="roadmap-copy">
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
        </div>
        <div class="roadmap-meta">
          <strong>${item.status === 'active' ? 'In progress' : item.status}</strong>
          <span>${escapeHtml(item.timing)}</span>
        </div>
      </article>
    `).join('');

    dom.activityTimeline.innerHTML = client.updates.map((update) => `
      <article class="activity-item">
        <span>${escapeHtml(update.date)}</span>
        <h3>${escapeHtml(update.title)}</h3>
        <p>${escapeHtml(update.copy)}</p>
      </article>
    `).join('');
  }

  function renderMaterials() {
    const readyCount = client.materials.filter((material) => material.status === 'ready').length;
    const waitingCount = client.materials.length - readyCount;
    dom.materialTotalCount.textContent = client.materials.length;
    dom.overviewMaterialCount.textContent = client.materials.length;
    dom.materialReadyCount.textContent = readyCount;
    dom.materialWaitingCount.textContent = waitingCount;

    dom.materialGrid.innerHTML = client.materials.map((material) => `
      <article class="material-card">
        <div class="material-card__top">
          <span class="file-type file-type--${escapeHtml(material.style)}">${escapeHtml(material.type)}</span>
          <span class="material-status ${material.status === 'waiting' ? 'is-waiting' : ''}">${escapeHtml(material.status)}</span>
        </div>
        <h2>${escapeHtml(material.title)}</h2>
        <p>${escapeHtml(material.description)}</p>
        <div class="card-footer">
          <span>${escapeHtml(material.meta)}</span>
          ${material.targetView
            ? `<button class="card-action" type="button" data-view-link="${escapeHtml(material.targetView)}">${escapeHtml(material.action)} →</button>`
            : `<button class="card-action" type="button" data-material-placeholder="${escapeHtml(material.action)}" ${material.status === 'waiting' ? 'aria-disabled="true"' : ''}>${escapeHtml(material.action)}</button>`
          }
        </div>
      </article>
    `).join('');
  }

  function renderKnowledge() {
    const recommended = client.knowledge.slice(0, 2);
    dom.overviewKnowledgeList.innerHTML = recommended.map((article) => `
      <button class="mini-knowledge" type="button" data-article-open="${escapeHtml(article.id)}">
        <span>${escapeHtml(article.category)} · ${escapeHtml(article.duration)}</span>
        <strong>${escapeHtml(article.title)}</strong>
      </button>
    `).join('');

    dom.knowledgeGrid.innerHTML = client.knowledge
      .filter((article) => article.id !== 'marketing-system')
      .map((article, index) => `
        <article class="knowledge-card" tabindex="0" role="button" data-article-open="${escapeHtml(article.id)}">
          <div class="knowledge-card__meta">
            <span>${escapeHtml(article.category)} · ${escapeHtml(article.duration)}</span>
            <span class="lesson-number">${String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2>${escapeHtml(article.title)}</h2>
          <p>${escapeHtml(article.description)}</p>
          <button class="card-action" type="button" tabindex="-1">Open guide →</button>
        </article>
      `).join('');
  }

  function openArticle(articleId) {
    const article = client.knowledge.find((item) => item.id === articleId);
    if (!article) return;

    dom.articleDialogContent.innerHTML = `
      <article class="article-content">
        <span class="section-kicker">${escapeHtml(article.category)} · ${escapeHtml(article.duration)} read</span>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.intro)}</p>
        <div class="article-steps">
          ${article.steps.map((step, index) => `
            <section class="article-step">
              <strong>${String(index + 1).padStart(2, '0')} · ${escapeHtml(step[0])}</strong>
              <p>${escapeHtml(step[1])}</p>
            </section>
          `).join('')}
        </div>
      </article>
    `;
    dom.articleDialog.showModal();
  }

  function renderForms() {
    dom.formsGrid.innerHTML = client.forms.map((form) => `
      <article class="form-card ${form.featured ? 'is-featured' : ''}">
        <div class="form-card__top">
          <span class="file-type">${form.status === 'active' ? 'FORM' : 'SOON'}</span>
          <span class="form-status ${form.status === 'draft' ? 'is-draft' : ''}">${escapeHtml(form.status)}</span>
        </div>
        <h2>${escapeHtml(form.title)}</h2>
        <p>${escapeHtml(form.description)}</p>
        <div class="card-footer">
          <span>${escapeHtml(form.timing)}</span>
          ${form.href
            ? `<a class="card-action" href="${escapeHtml(form.href)}">Open form →</a>`
            : '<span class="card-action" aria-disabled="true">Not available yet</span>'
          }
        </div>
      </article>
    `).join('');
  }

  function renderQuestions() {
    dom.savedQuestionCount.textContent = savedQuestions.length;
    dom.savedQuestionList.innerHTML = savedQuestions.length
      ? savedQuestions.map((question) => `
          <article class="saved-question-item">
            <div class="saved-question-item__top">
              <strong>${escapeHtml(question.topic)}</strong>
              <span>${escapeHtml(question.date)}</span>
            </div>
            <p>${escapeHtml(question.message)}</p>
            <button class="delete-question" type="button" data-delete-question="${escapeHtml(question.id)}">Delete</button>
          </article>
        `).join('')
      : '<div class="empty-state">No saved questions yet. Use the form to prepare a note for your next project conversation.</div>';

    document.querySelectorAll('[data-delete-question]').forEach((button) => {
      button.addEventListener('click', () => {
        savedQuestions = savedQuestions.filter((question) => question.id !== button.dataset.deleteQuestion);
        localStorage.setItem(questionStorageKey, JSON.stringify(savedQuestions));
        renderQuestions();
      });
    });
  }

  function saveQuestion(event) {
    event.preventDefault();
    const formData = new FormData(dom.questionForm);
    const message = String(formData.get('message') || '').trim();
    if (!message) return;

    savedQuestions.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      topic: String(formData.get('topic') || 'Other'),
      message,
      date: new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    });
    localStorage.setItem(questionStorageKey, JSON.stringify(savedQuestions));
    dom.questionForm.reset();
    renderQuestions();
    showToast('Question saved on this device.');
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 2800);
  }

  function bindEvents() {
    document.querySelectorAll('[data-view-target], [data-view-link]').forEach((control) => {
      control.addEventListener('click', () => switchView(control.dataset.viewTarget || control.dataset.viewLink));
    });

    dom.mobileMenu.addEventListener('click', () => {
      dom.body.classList.contains('menu-open') ? closeMobileMenu() : openMobileMenu();
    });
    dom.mobileBackdrop.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('[data-task-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activeTaskFilter = button.dataset.taskFilter;
        document.querySelectorAll('[data-task-filter]').forEach((filterButton) => {
          filterButton.classList.toggle('is-active', filterButton === button);
        });
        renderTasks();
      });
    });

    document.addEventListener('click', (event) => {
      const articleTrigger = event.target.closest('[data-article-open]');
      if (articleTrigger) openArticle(articleTrigger.dataset.articleOpen);

      const placeholder = event.target.closest('[data-material-placeholder]');
      if (placeholder && placeholder.getAttribute('aria-disabled') !== 'true') {
        showToast('This material card is ready for a real file or link.');
      }
    });

    document.addEventListener('keydown', (event) => {
      const trigger = event.target.closest('[data-article-open]');
      if (trigger && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openArticle(trigger.dataset.articleOpen);
      }
      if (event.key === 'Escape') closeMobileMenu();
    });

    dom.dialogClose.addEventListener('click', () => dom.articleDialog.close());
    dom.articleDialog.addEventListener('click', (event) => {
      if (event.target === dom.articleDialog) dom.articleDialog.close();
    });
    dom.questionForm.addEventListener('submit', saveQuestion);
  }

  function init() {
    applyClientContent();
    renderTasks();
    renderRoadmap();
    renderMaterials();
    renderKnowledge();
    renderForms();
    renderQuestions();
    bindEvents();

    const initialView = window.location.hash.replace('#', '');
    if (initialView && document.querySelector(`[data-view="${initialView}"]`)) {
      switchView(initialView);
    }
  }

  init();
})();
