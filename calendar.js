/* ═══════════════════════════════════════════════════════════
   MA3 STUDIO — CALENDAR ENGINE
   Supabase Integration · Role-based Views · Event Management
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── SUPABASE SETUP ──
  const SUPABASE_URL = 'https://mnqrblzdpdttdynlpqey.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_8-a0MZscMktjlzVckFE_sg_cflra1Qe';

  let sb = null;
  if (window.supabase) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.error('Supabase library not loaded.');
  }

  // ── USER STATE ──
  let currentUser = {
    role: localStorage.getItem('ma3-user-role') || 'guest',
    id: localStorage.getItem('ma3-user-id') || null,
    name: localStorage.getItem('ma3-user-name') || null,
  };

  // ── CALENDAR STATE ──
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();
  let selectedDay = null;
  let eventsCache = [];

  // ── i18n ──
  const STORAGE_KEY = 'ma3-lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'cz', 'ru', 'ua'];

  function detectLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    return DEFAULT_LANG;
  }

  let currentLang = detectLanguage();

  function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    const langMap = { en: 'en', cz: 'cs', ru: 'ru', ua: 'uk' };
    document.documentElement.lang = langMap[lang] || 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (typeof MA3_TRANSLATIONS !== 'undefined' && MA3_TRANSLATIONS[key] && MA3_TRANSLATIONS[key][lang]) {
        el.textContent = MA3_TRANSLATIONS[key][lang];
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  const MONTH_NAMES = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    cz: ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    ua: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
  };

  const calGrid = document.getElementById('cal-grid');
  const monthLabel = document.getElementById('cal-month-label');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const eventsList = document.getElementById('events-list');
  const eventsPanelTitle = document.getElementById('events-panel-title');
  const eventPopup = document.getElementById('event-popup');
  const eventPopupContent = document.getElementById('event-popup-content');
  const eventPopupClose = document.getElementById('event-popup-close');
  const clubGatePopup = document.getElementById('club-gate-popup');
  const clubGateClose = document.getElementById('club-gate-close');
  const userBadge = document.getElementById('user-badge');
  const guestCta = document.getElementById('guest-cta');

  function updateMonthLabel() {
    const names = MONTH_NAMES[currentLang] || MONTH_NAMES.en;
    monthLabel.textContent = `${names[currentMonth]} ${currentYear}`;
  }

  function renderCalendar() {
    calGrid.innerHTML = '';
    updateMonthLabel();
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day cal-day--empty';
      calGrid.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('button');
      dayEl.className = 'cal-day';
      dayEl.type = 'button';
      const dayNum = document.createElement('span');
      dayNum.className = 'cal-day__num';
      dayNum.textContent = d;
      dayEl.appendChild(dayNum);
      if (d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayEl.classList.add('cal-day--today');
      }
      if (d === selectedDay) {
        dayEl.classList.add('cal-day--selected');
      }
      const dayEvents = getEventsForDay(d);
      if (dayEvents.length > 0) {
        dayEl.classList.add('cal-day--has-events');
        const dots = document.createElement('div');
        dots.className = 'cal-day__dots';
        const types = [...new Set(dayEvents.map(e => e.type))];
        types.slice(0, 3).forEach(type => {
          const dot = document.createElement('span');
          dot.className = `cal-dot cal-dot--${type}`;
          dots.appendChild(dot);
        });
        dayEl.appendChild(dots);
      }
      dayEl.addEventListener('click', () => selectDay(d));
      calGrid.appendChild(dayEl);
    }
  }

  function selectDay(day) {
    selectedDay = day;
    renderCalendar();
    renderEventsForDay(day);
  }

  async function fetchEventsForMonth() {
    if (!sb) {
      eventsCache = getDemoEvents();
      renderCalendar();
      return;
    }
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
    try {
      let query = sb.from('events').select('*').gte('start_time', startOfMonth).lte('start_time', endOfMonth).eq('status', 'confirmed').order('start_time', { ascending: true });
      const { data, error } = await query;
      if (error) {
        eventsCache = getDemoEvents();
      } else {
        eventsCache = data || [];
        if (eventsCache.length === 0) eventsCache = getDemoEvents();
      }
    } catch (err) {
      eventsCache = getDemoEvents();
    }
    renderCalendar();
  }

  function getEventsForDay(day) {
    return eventsCache.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === day && eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  }

  function renderEventsForDay(day) {
    const events = getEventsForDay(day);
    const monthNames = MONTH_NAMES[currentLang] || MONTH_NAMES.en;
    eventsPanelTitle.textContent = `${day} ${monthNames[currentMonth]}`;
    if (events.length === 0) {
      eventsList.innerHTML = `<div class="events-empty"><p>No events this day</p></div>`;
      return;
    }
    eventsList.innerHTML = '';
    events.forEach(event => {
      const card = document.createElement('div');
      const isLocked = event.type === 'club' && currentUser.role === 'guest';
      card.className = `event-card event-card--${event.type}${isLocked ? ' event-card--locked' : ''}`;
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);
      const timeStr = `${formatTime(startTime)} — ${formatTime(endTime)}`;
      card.innerHTML = `
        <div class="event-card__header">
          <span class="event-card__badge event-card__badge--${event.type}">${event.type}</span>
          <span class="event-card__time">${timeStr}</span>
        </div>
        <h4 class="event-card__title">${isLocked ? 'Club Activity' : event.title}</h4>
      `;
      card.addEventListener('click', () => isLocked ? openClubGate() : openEventPopup(event));
      eventsList.appendChild(card);
    });
  }

  function formatTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }

  function openEventPopup(event) {
    eventPopupContent.innerHTML = `<h2>${event.title}</h2><p>${event.description || ''}</p>`;
    eventPopup.classList.add('open');
  }

  function openClubGate() { clubGatePopup.classList.add('open'); }
  function closePopup(popup) { popup.classList.remove('open'); }

  function getDemoEvents() {
    return [
      { id: '1', title: 'Agency Strategy Meetup', start_time: new Date(currentYear, currentMonth, 10, 10).toISOString(), end_time: new Date(currentYear, currentMonth, 10, 12).toISOString(), type: 'public' },
      { id: '2', title: 'Automation Workshop', start_time: new Date(currentYear, currentMonth, 15, 14).toISOString(), end_time: new Date(currentYear, currentMonth, 15, 16).toISOString(), type: 'club' }
    ];
  }

  function updateUserBadge() {
    userBadge.className = `user-badge user-badge--${currentUser.role}`;
    if (guestCta) guestCta.style.display = currentUser.role === 'guest' ? 'flex' : 'none';
  }

  prevBtn.addEventListener('click', () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } fetchEventsForMonth(); });
  nextBtn.addEventListener('click', () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } fetchEventsForMonth(); });
  eventPopupClose.addEventListener('click', () => closePopup(eventPopup));
  clubGateClose.addEventListener('click', () => closePopup(clubGatePopup));

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => { applyTranslations(btn.dataset.lang); renderCalendar(); });
  });

  function init() { applyTranslations(currentLang); updateUserBadge(); fetchEventsForMonth(); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
