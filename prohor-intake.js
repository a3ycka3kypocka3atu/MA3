(function () {
  'use strict';

  const CLIENT = {
    slug: 'prohor',
    name: 'Prohor Music',
    project: 'Анкета стратегии артиста',
    version: '2026-06-26-clean',
  };

  // Paste the deployed Google Apps Script Web App URL here.
  const SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz-gi4dPRrWjKZGyDwJvzGY0UP4Vl-v0zKraZSptiSQJ62739PIFq8bpL8j-Vjy_RSDOw/exec';

  const STORAGE_KEY = `ma3:intake:${CLIENT.slug}:v2`;
  const SAVE_DELAY = 450;

  const sections = [
    {
      id: 'operations',
      code: 'A',
      title: 'Операционные вопросы',
      note: 'Для этапов воронки и медиа: логика бронирования, источники заявок, premium proof.',
      priority: 'важно',
      fields: [
        {
          id: 'booking_lead_time',
          type: 'radio',
          label: 'Сколько сейчас обычно проходит времени от “клиент написал” до “выступление состоялось”?',
          options: ['До 1 недели', '1-4 недели', '1-3 месяца', '3+ месяца', 'Зависит от типа ивента'],
        },
        {
          id: 'booking_lead_time_context',
          type: 'textarea',
          label: 'Добавь реальный контекст по срокам',
          placeholder: 'Например: приватные ивенты быстрее, фестивали планируются за 2-3 месяца...',
        },
        {
          id: 'booking_sources',
          type: 'checkboxes',
          label: 'Откуда сейчас приходят запросы на выступления?',
          options: ['Instagram DM', 'WhatsApp / Telegram напрямую', 'Через знакомых', 'Промоутеры', 'Email / форма на сайте', 'Другое'],
        },
        {
          id: 'booking_sources_details',
          type: 'textarea',
          label: 'Какие каналы реально дают самые качественные запросы?',
          placeholder: 'Что работает лучше, что почти не работает, где приходят лучшие клиенты...',
        },
        {
          id: 'premium_precedents',
          type: 'textarea',
          label: 'Есть ли уже premium-tier выступления или близкие к этому прецеденты?',
          hint: 'Яхта, вилла, закрытый ивент, разогрев на фестивале, приватный luxury event.',
          placeholder: '1-2 примера с локацией, форматом и результатом. Если пока не было — напиши “пока нет”.',
        },
      ],
    },
    {
      id: 'content-production',
      code: 'B',
      title: 'Контент-производство',
      note: 'Для креативной стратегии: что уже есть в сыром виде и что можно быстро превратить в контент.',
      priority: 'важно',
      fields: [
        {
          id: 'raw_materials',
          type: 'checkboxes',
          label: 'Что ты сейчас снимаешь или уже имеешь в сырых материалах?',
          options: ['Behind the scenes с сетов', 'Studio sessions', 'Путешествия / lifestyle', 'Рабочие процессы с музыкой', 'Оборудование / setup', 'Ничего системно'],
        },
        {
          id: 'raw_materials_details',
          type: 'textarea',
          label: 'Что из этого можно реально найти и передать нам?',
          placeholder: 'Где лежат файлы, в каком формате, что самое сильное по эмоции...',
        },
        {
          id: 'past_show_footage',
          type: 'textarea',
          label: 'Есть ли stock-видео с прошлых выступлений?',
          hint: 'Даже 3-5 клипов с разных сетов уже очень полезны.',
          placeholder: 'Сколько клипов, какие локации, качество, вертикальные/горизонтальные...',
        },
        {
          id: 'upcoming_events',
          type: 'textarea',
          label: 'Какие события или поездки запланированы на ближайшие 6 месяцев?',
          placeholder: 'Дата / город / формат / что можно снять до, во время и после события...',
        },
        {
          id: 'ugc_team',
          type: 'radio',
          label: 'Есть ли UGC-команда или videographer на локации?',
          options: ['Да, есть videographer', 'Есть человек с телефоном', 'Иногда есть', 'Все снимаю сам', 'Пока нет'],
        },
        {
          id: 'ugc_team_details',
          type: 'textarea',
          label: 'Как сейчас выглядит реальный процесс съемки?',
          placeholder: 'Кто снимает, когда, на что, можно ли давать shot-list...',
        },
      ],
    },
    {
      id: 'story-narrative',
      code: 'C',
      title: 'История и нарратив',
      note: 'Для креатива и оффера: личный слой бренда, который не видно из PDF.',
      priority: 'средне',
      fields: [
        {
          id: 'personal_music_story',
          type: 'textarea',
          label: 'Какая твоя личная история в музыке — коротко, 3-5 предложений?',
          placeholder: 'Своими словами: с чего начал, почему именно музыка, что изменилось со временем...',
        },
        {
          id: 'why_music_when_hard',
          type: 'textarea',
          label: 'Что тебя удерживает в музыке сейчас, когда сложно?',
          placeholder: 'Лично, честно, без “пресс-релизного” стиля.',
        },
        {
          id: 'career_anchor_moment',
          type: 'textarea',
          label: 'Какой один момент карьеры был “тогда я понял, что это мое”?',
          placeholder: 'Событие, выступление, момент в студии, реакция людей, внутреннее решение...',
        },
      ],
    },
    {
      id: 'technical',
      code: 'D',
      title: 'Технические вопросы',
      note: 'Для EPK и медиа: райдер, длина сетов, снижение рисков для организатора.',
      priority: 'средне',
      fields: [
        {
          id: 'tech_rider_exists',
          type: 'radio',
          label: 'Техрайдер существует?',
          options: ['Да, полный', 'Да, базовый', 'Есть в голове, но не оформлен', 'Пока нет'],
        },
        {
          id: 'tech_rider_details',
          type: 'textarea',
          label: 'Что точно должно быть в техрайдере?',
          placeholder: 'Pioneer, audio interface, monitors, microphone, lighting, back-to-back requirements...',
        },
        {
          id: 'set_lengths',
          type: 'textarea',
          label: 'Длина сетов — какой минимальный и комфортный формат?',
          placeholder: '1.5h / 2h / 4h / B2B / private event / festival format...',
        },
        {
          id: 'backup_dj',
          type: 'radio',
          label: 'Нужен ли back-up DJ на случай форс-мажора?',
          options: ['Есть свой человек', 'Нужно найти', 'Не нужно', 'Не знаю'],
        },
        {
          id: 'backup_dj_details',
          type: 'textarea',
          label: 'Как сейчас закрываешь риски форс-мажора?',
          placeholder: 'Запасное оборудование, люди, travel buffer, контакты организатора...',
        },
      ],
    },
    {
      id: 'partnerships',
      code: 'E',
      title: 'Партнерства и коллаборации',
      note: 'Для медиа-стратегии: коллабы, cross-promo, ориентир на 12-24 месяца.',
      priority: 'дополнительно',
      fields: [
        {
          id: 'artist_network',
          type: 'textarea',
          label: 'С кем из артистов дружишь или уже работал?',
          placeholder: '3-5 имен, даже если не top-tier. Можно добавить формат знакомства/коллабы.',
        },
        {
          id: 'future_partners',
          type: 'textarea',
          label: 'Есть ли лейбл, менеджмент или booking agent, с которыми готов сотрудничать в будущем?',
          placeholder: 'Сейчас / через 12 месяцев / что должно измениться, чтобы это стало актуально...',
        },
        {
          id: 'dream_benchmark_artists',
          type: 'textarea',
          label: 'Кто из артистов в твоем жанре — уровень мечты?',
          placeholder: '1-2 конкретных имени, на кого реально равняться через 12-24 месяца.',
        },
      ],
    },
    {
      id: 'tone-of-voice',
      code: 'F',
      title: 'Тон коммуникации',
      note: 'Для креатива: social proof, контентные углы, anti-positioning.',
      priority: 'дополнительно',
      fields: [
        {
          id: 'words_from_friends_fans',
          type: 'textarea',
          label: '3-5 слов, которыми тебя описывают друзья или фаны',
          placeholder: 'Например: глубокий, легкий, честный, энергичный...',
        },
        {
          id: 'industry_frustrations',
          type: 'textarea',
          label: 'Что тебя бесит в музыкальной индустрии?',
          placeholder: 'Мифы, фальшь, поведение, подходы, которые хочется ломать или обходить...',
        },
        {
          id: 'anti_brand_associations',
          type: 'textarea',
          label: 'С чем точно НЕ хочешь, чтобы ассоциировался твой бренд?',
          placeholder: 'Визуально, по тону, по поведению, по аудитории или по типу ивентов...',
        },
      ],
    },
  ];

  const dom = {
    form: document.getElementById('intake-form'),
    sectionList: document.getElementById('section-list'),
    sectionNav: document.getElementById('section-nav'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    saveIndicator: document.getElementById('save-indicator'),
    syncIndicator: document.getElementById('sync-indicator'),
    toast: document.getElementById('toast'),
  };

  const state = loadState();
  normalizeState();
  let saveTimer = null;
  let toastTimer = null;

  function loadState() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('reset') === '1') {
      localStorage.removeItem(STORAGE_KEY);
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        respondentId: saved.respondentId || createRespondentId(),
        currentSection: saved.currentSection || sections[0].id,
        completedSections: Array.isArray(saved.completedSections) ? saved.completedSections : [],
        editedSections: Array.isArray(saved.editedSections) ? saved.editedSections : [],
        answers: saved.answers || {},
        updatedAt: saved.updatedAt || null,
        lastSyncedAt: saved.lastSyncedAt || null,
      };
    } catch (error) {
      return {
        respondentId: createRespondentId(),
        currentSection: sections[0].id,
        completedSections: [],
        editedSections: [],
        answers: {},
        updatedAt: null,
        lastSyncedAt: null,
      };
    }
  }

  function createRespondentId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return `${CLIENT.slug}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeState() {
    state.completedSections = state.completedSections.filter((sectionId) => {
      return sections.some((section) => section.id === sectionId);
    });

    state.editedSections = state.editedSections.filter((sectionId) => {
      return sections.some((section) => section.id === sectionId);
    });

    syncCompletedSectionsFromAnswers();

    const currentIndex = sections.findIndex((section) => section.id === state.currentSection);
    if (currentIndex === -1) {
      state.currentSection = sections[0].id;
      saveLocal();
    }
  }

  function saveLocal(message) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (dom.saveIndicator) {
      dom.saveIndicator.textContent = message || `Сохранено локально ${formatTime(state.updatedAt)}`;
    }
  }

  function formatTime(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  function render() {
    renderNav();
    renderSections();
    updateProgress();
    updateSyncIndicator();
  }

  function renderNav() {
    dom.sectionNav.innerHTML = sections.map((section, index) => {
      const complete = isSectionComplete(section);
      const active = state.currentSection === section.id;
      const locked = isLocked(index);
      const classes = [
        active ? 'is-active' : '',
        complete ? 'is-complete' : '',
      ].filter(Boolean).join(' ');

      return `
        <li>
          <button class="${classes}" type="button" data-nav-section="${section.id}" ${locked ? 'disabled' : ''}>
            <span class="nav-index">${complete ? '✓' : section.code}</span>
            <span class="nav-title">${escapeHtml(section.title)}</span>
          </button>
        </li>
      `;
    }).join('');
  }

  function renderSections() {
    dom.sectionList.innerHTML = sections.map((section, index) => {
      const complete = isSectionComplete(section);
      const edited = state.editedSections.includes(section.id);
      const active = state.currentSection === section.id;
      const locked = isLocked(index);
      const canOpen = !locked;
      const showEditButton = canOpen && !active && (complete || edited);
      const classes = [
        'section-card',
        active ? 'is-active' : '',
        complete ? 'is-complete' : '',
        edited ? 'is-edited' : '',
        locked ? 'is-locked' : '',
      ].filter(Boolean).join(' ');

      return `
        <article class="${classes}" data-section-card="${section.id}">
          <div class="section-head ${canOpen ? 'is-clickable' : ''}" ${canOpen ? `data-open-section="${section.id}" role="button" tabindex="0"` : ''}>
            <div>
              <p class="section-kicker">Блок ${section.code} / ${section.priority}</p>
              <h2 class="section-title">${escapeHtml(section.title)}</h2>
              <p class="section-note">${escapeHtml(section.note)}</p>
            </div>
            <div class="section-head-actions">
              <span class="section-state">${getSectionStateLabel(section, index)}</span>
              ${showEditButton ? `<button class="section-edit-btn" type="button" data-nav-section="${section.id}">Изменить</button>` : ''}
            </div>
          </div>
          <div class="section-body">
            <div class="field-grid">
              ${section.fields.map(renderField).join('')}
            </div>
            <div class="actions">
              ${index > 0 ? `<button class="action-btn ghost" type="button" data-prev-section="${sections[index - 1].id}">Назад</button>` : ''}
              <button class="action-btn secondary" type="button" data-save-section="${section.id}">Сохранить блок</button>
              <button class="action-btn primary" type="button" data-next-section="${section.id}">
                ${index === sections.length - 1 ? 'Сохранить и завершить' : 'Сохранить и дальше'}
              </button>
            </div>
            <div class="completion-panel ${isEverythingComplete() && index === sections.length - 1 ? 'is-visible' : ''}">
              <strong>Анкета завершена.</strong>
              Ответы сохранены в этом браузере${SHEETS_WEB_APP_URL ? ' и отправлены в Google Sheets.' : '. После подключения ссылки Google Sheets они также будут отправляться в таблицу.'}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderField(field) {
    const answer = state.answers[field.id];
    const hint = field.hint ? `<p class="field-hint">${escapeHtml(field.hint)}</p>` : '';

    if (field.type === 'textarea') {
      return `
        <label class="field" for="${field.id}">
          <span class="field-label">${escapeHtml(field.label)}</span>
          ${hint}
          <textarea id="${field.id}" name="${field.id}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(answer || '')}</textarea>
        </label>
      `;
    }

    if (field.type === 'radio') {
      return `
        <fieldset class="field">
          <legend class="field-label">${escapeHtml(field.label)}</legend>
          ${hint}
          <div class="choice-grid">
            ${field.options.map((option) => `
              <label class="choice">
                <input type="checkbox" name="${field.id}" data-single-choice="${field.id}" value="${escapeHtml(option)}" ${answer === option ? 'checked' : ''}>
                <span>${escapeHtml(option)}</span>
              </label>
            `).join('')}
          </div>
        </fieldset>
      `;
    }

    if (field.type === 'checkboxes') {
      const values = Array.isArray(answer) ? answer : [];

      return `
        <fieldset class="field">
          <legend class="field-label">${escapeHtml(field.label)}</legend>
          ${hint}
          <div class="choice-grid">
            ${field.options.map((option) => `
              <label class="choice">
                <input type="checkbox" name="${field.id}" value="${escapeHtml(option)}" ${values.includes(option) ? 'checked' : ''}>
                <span>${escapeHtml(option)}</span>
              </label>
            `).join('')}
          </div>
        </fieldset>
      `;
    }

    return '';
  }

  function getSectionStateLabel(section, index) {
    if (isSectionComplete(section)) return 'сохранено';
    if (state.editedSections.includes(section.id)) return 'изменено';
    if (state.currentSection === section.id) return 'активно';
    if (isLocked(index)) return 'закрыто';
    return 'открыто';
  }

  function isLocked(index) {
    return false;
  }

  function hasAnswer(value) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return String(value || '').trim() !== '';
  }

  function isSectionComplete(section) {
    return section.fields.every((field) => hasAnswer(state.answers[field.id]));
  }

  function syncCompletedSectionsFromAnswers() {
    state.completedSections = sections
      .filter(isSectionComplete)
      .map((section) => section.id);

    state.editedSections = state.editedSections.filter((sectionId) => {
      return !state.completedSections.includes(sectionId);
    });
  }

  function collectAnswers() {
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'checkboxes') {
          state.answers[field.id] = Array.from(dom.form.querySelectorAll(`[name="${field.id}"]:checked`)).map((input) => input.value);
          return;
        }

        if (field.type === 'radio') {
          const checked = dom.form.querySelector(`[name="${field.id}"]:checked`);
          state.answers[field.id] = checked ? checked.value : '';
          return;
        }

        const input = dom.form.elements[field.id];
        state.answers[field.id] = input ? input.value.trim() : '';
      });
    });

    syncCompletedSectionsFromAnswers();
  }

  function setCurrentSection(sectionId) {
    state.currentSection = sectionId;
    saveLocal();
    render();

    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-section-card="${sectionId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  async function saveSection(sectionId, shouldAdvance) {
    const index = sections.findIndex((section) => section.id === sectionId);
    const section = sections[index];
    if (!section || isLocked(index)) return;

    clearTimeout(saveTimer);

    const buttons = Array.from(document.querySelectorAll(`[data-save-section="${sectionId}"], [data-next-section="${sectionId}"]`));
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = 'Сохраняю...';
    });

    collectAnswers();

    state.editedSections = state.editedSections.filter((editedSectionId) => editedSectionId !== sectionId);

    if (shouldAdvance && index < sections.length - 1) {
      state.currentSection = sections[index + 1].id;
    } else {
      state.currentSection = sectionId;
    }

    saveLocal(`Блок ${section.code} сохранен ${formatTime(state.updatedAt)}`);
    render();
    await syncSection(section);

    if (shouldAdvance && index === sections.length - 1) {
      await syncAllComplete();
      showToast('Анкета завершена. Спасибо, ответы сохранены.');
    } else if (shouldAdvance) {
      showToast(`Блок ${section.code} сохранен. Открыт следующий блок.`);
    } else {
      showToast(`Блок ${section.code} сохранен.`);
    }
  }

  async function syncSection(section) {
    if (!SHEETS_WEB_APP_URL) {
      updateSyncIndicator('Google Sheets не подключен', 'warn');
      return;
    }

    const payload = createPayload('section_saved', section);

    try {
      updateSyncIndicator('Отправляю в Google Sheets...', 'warn');
      await sendToSheets(payload);
      state.lastSyncedAt = new Date().toISOString();
      saveLocal();
      updateSyncIndicator(`Отправлено ${formatTime(state.lastSyncedAt)}`, 'live');
    } catch (error) {
      updateSyncIndicator('Ошибка отправки в Google Sheets', 'warn');
      showToast('Локально сохранено. Google Sheets сейчас не ответил.');
    }
  }

  async function syncAllComplete() {
    if (!SHEETS_WEB_APP_URL) return;

    try {
      await sendToSheets(createPayload('survey_completed'));
      state.lastSyncedAt = new Date().toISOString();
      saveLocal();
      updateSyncIndicator(`Финально отправлено ${formatTime(state.lastSyncedAt)}`, 'live');
    } catch (error) {
      showToast('Финальный sync не прошел, но локальная копия сохранена.');
    }
  }

  function createPayload(eventType, section) {
    const sectionAnswers = section
      ? section.fields.reduce((acc, field) => {
        acc[field.id] = state.answers[field.id] || (field.type === 'checkboxes' ? [] : '');
        return acc;
      }, {})
      : {};
    const sectionQuestionAnswers = section ? getQuestionAnswers([section]) : [];

    return {
      eventType,
      client: CLIENT,
      respondentId: state.respondentId,
      sectionId: section ? section.id : '',
      sectionCode: section ? section.code : '',
      sectionTitle: section ? section.title : '',
      sectionAnswers,
      sectionQuestionAnswers,
      allQuestionAnswers: getQuestionAnswers(sections),
      allAnswers: state.answers,
      completedSections: state.completedSections,
      progressPercent: getProgressPercent(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };
  }

  function getQuestionAnswers(sourceSections) {
    return sourceSections.flatMap((section) => {
      return section.fields.map((field) => {
        const answer = state.answers[field.id] || (field.type === 'checkboxes' ? [] : '');

        return {
          sectionId: section.id,
          sectionCode: section.code,
          sectionTitle: section.title,
          fieldId: field.id,
          fieldType: field.type,
          question: field.label,
          answer,
        };
      });
    });
  }

  function sendToSheets(payload) {
    const form = new URLSearchParams();
    form.set('payload', JSON.stringify(payload));

    return fetch(SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: form.toString(),
    });
  }

  function updateProgress() {
    const percent = getProgressPercent();
    dom.progressPercent.textContent = `${percent}%`;
    dom.progressFill.style.width = `${percent}%`;
  }

  function getProgressPercent() {
    return Math.round((state.completedSections.length / sections.length) * 100);
  }

  function isEverythingComplete() {
    return state.completedSections.length === sections.length;
  }

  function updateSyncIndicator(message, tone) {
    const hasEndpoint = Boolean(SHEETS_WEB_APP_URL);
    const text = message || (hasEndpoint
      ? state.lastSyncedAt
        ? `Google Sheets синхронизировано ${formatTime(state.lastSyncedAt)}`
        : 'Google Sheets подключен'
      : 'Google Sheets не подключен');

    if (!dom.syncIndicator) return;
    dom.syncIndicator.textContent = text;
    dom.syncIndicator.classList.toggle('is-live', tone === 'live' || (hasEndpoint && !tone));
    dom.syncIndicator.classList.toggle('is-warn', tone === 'warn' || (!hasEndpoint && !tone));
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 3200);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function markSectionEdited(sectionId) {
    if (!sectionId || !state.completedSections.includes(sectionId) || state.editedSections.includes(sectionId)) {
      return;
    }

    state.editedSections.push(sectionId);

    const card = document.querySelector(`[data-section-card="${sectionId}"]`);
    const badge = card ? card.querySelector('.section-state') : null;
    if (card) card.classList.add('is-edited');
    if (badge) badge.textContent = 'изменено';
  }

  dom.form.addEventListener('input', (event) => {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const card = event.target.closest('[data-section-card]');
      if (card) {
        markSectionEdited(card.dataset.sectionCard);
      }

      collectAnswers();
      renderNav();
      updateProgress();
      saveLocal(`Черновик сохранен ${formatTime(new Date().toISOString())}`);
    }, SAVE_DELAY);
  });

  dom.form.addEventListener('change', (event) => {
    if (event.target.matches('input[data-single-choice]') && event.target.checked) {
      dom.form
        .querySelectorAll(`input[data-single-choice="${event.target.dataset.singleChoice}"]`)
        .forEach((input) => {
          if (input !== event.target) {
            input.checked = false;
          }
        });
    }

    if (!event.target.matches('input[type="radio"], input[type="checkbox"]')) {
      return;
    }

    const card = event.target.closest('[data-section-card]');
    if (card) {
      markSectionEdited(card.dataset.sectionCard);
    }

    collectAnswers();
    renderNav();
    updateProgress();
    saveLocal(`Черновик сохранен ${formatTime(new Date().toISOString())}`);
  });

  document.addEventListener('click', (event) => {
    const openedSection = event.target.closest('[data-open-section]');
    if (openedSection && !event.target.closest('button, input, textarea, label, a')) {
      setCurrentSection(openedSection.dataset.openSection);
      return;
    }

    const nav = event.target.closest('[data-nav-section]');
    if (nav && !nav.disabled) {
      setCurrentSection(nav.dataset.navSection);
      return;
    }

    const saveButton = event.target.closest('[data-save-section]');
    if (saveButton) {
      saveSection(saveButton.dataset.saveSection, false);
      return;
    }

    const prevButton = event.target.closest('[data-prev-section]');
    if (prevButton) {
      setCurrentSection(prevButton.dataset.prevSection);
      return;
    }

    const nextButton = event.target.closest('[data-next-section]');
    if (nextButton) {
      saveSection(nextButton.dataset.nextSection, true);
    }
  });

  document.addEventListener('keydown', (event) => {
    const openedSection = event.target.closest('[data-open-section]');
    if (!openedSection || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    setCurrentSection(openedSection.dataset.openSection);
  });

  window.addEventListener('beforeunload', () => {
    collectAnswers();
    saveLocal();
  });

  render();
}());
