(function () {
  'use strict';

  const TRANSLATIONS = window.CLIENT_SPACE_I18N || {};
  const languageStorageKey = '34forfree7:client-space:language:v1';
  const staticTextSources = new WeakMap();
  const attributeSources = new WeakMap();
  let currentLanguage = readLanguagePreference();

  // Reusable client records: add one keyed object per client and open it with
  // client-space.html?client=their-slug. The cabinet interface stays unchanged.
  // Every section can be adapted or omitted as the client project requires.
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
        date: '1 August 2026',
        title: 'Your brand compass and working strategy are now visible',
        copy: 'The positioning board and agency research are translated into a practical brand system, audience choices, open questions, and next decisions.',
      },
      strategy: {
        version: 'Working strategy v0.5',
        source: 'Miro positioning draft · 1 Aug 2026 + agency research snapshot · 24 Jun 2026',
        positioning: 'A Prague-based electronic artist blending disciplined growth, original musical worlds, and playful human energy into premium live experiences.',
        direction: 'Move gradually from general corporate and club work toward premium events, festivals, villas, yachts, and international opportunities—without losing the warmth, playfulness, and personal values that make Prohor recognizable.',
        northStar: 'Confirmed premium bookings generated through the EPK funnel',
        evidence: [
          { value: '1,403', label: 'Instagram audience', note: '~8.5% engagement rate' },
          { value: '1,845', label: 'Caladan plays', note: 'Organic SoundCloud baseline' },
          { value: '6 tracks', label: 'Kaitain EP', note: 'Released through CDj' },
          { value: '0', label: 'Email subscribers', note: 'A clear retention opportunity' },
        ],
        brandCompass: [
          {
            key: 'architecture',
            label: 'Brand architecture',
            title: 'Hero at the core. Creator in the form. Jester in the energy.',
            detail: 'Growth and discipline create trust; original musical worlds create distinction; warmth and play keep the artist human.',
          },
          {
            key: 'tension',
            label: 'Creative tension',
            title: 'Discipline ↔ freedom. Serious path ↔ joy and play.',
            detail: 'The brand becomes interesting at the point where professional demands meet a personal, authorial voice.',
          },
          {
            key: 'promise',
            label: 'Audience promise',
            title: 'A distinctive moment that helps people feel inspired and true to themselves.',
            detail: 'This is the emotional outcome to prove through music, live atmosphere, story, and recognizable rituals.',
          },
          {
            key: 'expression',
            label: 'Expression system',
            title: 'A disciplined base with one surprising, expressive accent.',
            detail: 'Light structure and premium clarity can hold eclectic styling, tea ritual, playful detail, and intentional imperfection.',
          },
        ],
        audiences: [
          {
            label: 'Listener community · client draft',
            status: 'Validate with analytics',
            title: 'People seeking balance, inspiration, and a distinctive experience',
            detail: 'Working profile: adults in creative and technology fields with disposable income, interested in health, travel, self-development, and music as escape or meditation.',
            role: 'They listen, follow, share, attend, and strengthen cultural demand.',
          },
          {
            label: 'Booking buyers · agency hypothesis',
            status: 'Validate with interviews',
            title: 'People responsible for premium events and artist bookings',
            detail: 'Working profile: event planners, promoters, club and festival teams, hospitality concepts, and booking agents who need event fit, proof, reliability, and a simple inquiry path.',
            role: 'They evaluate, shortlist, inquire, negotiate, and confirm the booking.',
          },
        ],
        guardrails: [
          {
            key: 'use',
            label: 'Bring forward',
            items: ['Artist journey and disciplined progress', 'Music-making process and creative decisions', 'Live reactions, atmosphere, and professional proof', 'Tea, travel, humor, and moments without pretence'],
          },
          {
            key: 'protect',
            label: 'Protect',
            items: ['Family and private relationships', 'Politics and commentary about other people', 'Unconfirmed future plans', 'Personal material that does not serve the audience'],
          },
          {
            key: 'avoid',
            label: 'Avoid',
            items: ['Clowning or memes for their own sake', 'Infantile humor in the core identity', 'Chaotic lifestyle content', 'Using the Jester voice in release statements or formal artist copy'],
          },
        ],
        truthGroups: [
          {
            key: 'known',
            label: 'Known',
            description: 'Supported by the client brief or existing channels.',
            items: [
              'Prohor is an individual DJ and producer based in Prague, originally from Kyiv.',
              'The sound spans Tech House, Melodic Techno, and Progressive House.',
              'Instagram is the strongest current audience hub; YouTube, SoundCloud, Beatport, Spotify, Facebook, and Telegram already exist.',
              'The positioning draft defines Hero as the core, Creator as the form, and Jester as the energy.',
              'The stated mission is to inspire people through music and a personal view of the world.',
              'The communication boundary keeps family, politics, other people, and unconfirmed future plans private.',
              'The 12-month direction prioritizes personal-brand growth and more premium international opportunities.',
            ],
          },
          {
            key: 'hypothesis',
            label: 'Working hypotheses',
            description: 'Useful directions that need client and market validation.',
            items: [
              'Primary buyers may be premium event planners, festival promoters, clubs, and booking agents across Europe.',
              'The listener profile may center on established adults in creative and technology fields who use music for balance, inspiration, and escape.',
              '“Cosmic Set Architecture” can turn the sound and set progression into a memorable booking mechanism.',
              'A three-level offer—Atmospheric, Cosmic, and Universe—may make different event formats easier to understand and sell.',
              'Instagram should remain the hub while YouTube builds authority, SoundCloud builds music proof, and TikTok supports discovery.',
              'Organic distribution should be measured before introducing paid promotion.',
            ],
          },
          {
            key: 'validate',
            label: 'Needs validation',
            description: 'Inputs required before commercial decisions become final.',
            items: [
              'Current bookings per month, revenue mix, and fees by event type.',
              'Real premium-event precedents, testimonials, audience reactions, and strongest performance footage.',
              'Technical rider, preferred set lengths, travel limits, and backup process.',
              'Minimum acceptable fee, package pricing, and 12-month numerical targets.',
              'Resolve the listener age range: the positioning board says 30–60 while the canonical brief says 30–40.',
              'Confirm the final archetype hierarchy because one board marker names only Hero and Jester while the detailed framework also includes Creator.',
              'Content boundaries, upcoming events, available raw material, and the real filming workflow.',
            ],
          },
        ],
        funnel: [
          { title: 'Discover', detail: 'Instagram, YouTube, SoundCloud, TikTok, Facebook', signal: 'Attention' },
          { title: 'Build trust', detail: 'Story, live proof, artist identity, useful content', signal: 'Interest' },
          { title: 'Explore EPK', detail: 'Positioning, sound, proof, event fit, offer clarity', signal: 'Intent' },
          { title: 'Send inquiry', detail: 'Short form with date, venue, budget, and event type', signal: 'Lead' },
          { title: 'Qualify & book', detail: 'Right conversation, proposal, contract, and deposit', signal: 'Revenue' },
          { title: 'Retain', detail: 'Post-event proof, email relationship, and repeat booking', signal: 'LTV' },
        ],
        contentPillars: [
          { number: '01', title: 'The artist’s path', role: 'Hero · authority', detail: 'Progress, discipline, training, difficult moments, milestones, and the work behind the next level.' },
          { number: '02', title: 'Behind the set', role: 'Creator · trust', detail: 'Music-making, track choices, studio process, unusual locations, and the craft behind the atmosphere.' },
          { number: '03', title: 'Tea, travel & life', role: 'Jester · recognition', detail: 'Tea ritual, humor, reactions, travel, and human moments—kept mainly in Stories, backstage, and live formats.' },
          { number: '04', title: 'Live moments', role: 'Proof · credibility', detail: 'Venues, reactions, crowd energy, event context, and moments that reduce booking uncertainty.' },
          { number: '05', title: 'From scene to booking', role: 'Bridge · conversion', detail: 'Content that explains event fit, booking process, professional standards, and the next action.' },
        ],
        gates: [
          { label: 'Now', title: 'Validate the missing inputs', detail: 'Complete the intake, booking examples, proof, assets, and commercial numbers.', status: 'active' },
          { label: 'Review', title: 'Approve positioning and offer', detail: 'Confirm audience priorities, the named mechanism, packages, and boundaries.', status: 'review' },
          { label: 'Next', title: 'Build the EPK booking path', detail: 'Create the destination page, inquiry form, response process, and measurement.', status: 'planned' },
          { label: 'Test', title: 'Run an organic learning cycle', detail: 'Connect content to the funnel and measure inquiries—not only reach.', status: 'planned' },
          { label: 'Later', title: 'Scale what proves itself', detail: 'Optimize the winning system and only then reconsider paid distribution.', status: 'later' },
        ],
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
          date: '1 Aug 2026',
          title: 'Strategy knowledge layer added',
          copy: 'Internal research is now organized into client-facing facts, hypotheses, priorities, and learning.',
        },
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
          id: 'review-strategy-map',
          title: 'Review the working strategy map',
          description: 'Check what we marked as known, hypothetical, and still missing. Save questions wherever something feels inaccurate.',
          category: 'Strategy review',
          effort: '15 min',
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
          type: 'MAP',
          style: 'document',
          title: 'Working strategy map',
          description: 'Client-facing synthesis of the brief, research, offer, funnel, content system, and open decisions.',
          status: 'ready',
          meta: 'Strategy layer',
          action: 'Open Strategy',
          targetView: 'strategy',
        },
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
          id: 'brand-compass',
          category: 'Your brand',
          duration: '6 min',
          title: 'How Hero, Creator, and Jester work as one brand',
          description: 'A practical guide to using each archetype without making the artist feel fragmented.',
          intro: 'The three archetypes do not need equal volume everywhere. The clearest system gives each one a job: Hero builds belief, Creator makes the work distinctive, and Jester creates warmth and recognition.',
          steps: [
            ['Hero sets the direction', 'Use the journey, discipline, ambition, and honest progress to establish meaning and professional credibility.'],
            ['Creator shows the difference', 'Use music-making, set design, visual ideas, and unusual environments to prove an original point of view.'],
            ['Jester adds energy', 'Use humor and spontaneity in Stories, backstage, and live moments—without letting it dominate release language or the core identity.'],
          ],
        },
        {
          id: 'booking-north-star',
          category: 'Your strategy',
          duration: '5 min',
          title: 'Why bookings—not followers—are the north star',
          description: 'How we connect content and audience growth to qualified premium booking conversations.',
          intro: 'Followers, views, and plays matter only when they strengthen recognition, proof, or demand. For this project, the clearest business outcome is a confirmed premium booking that can be traced back to the marketing system.',
          steps: [
            ['Measure the journey', 'Track which content and channels bring people to the EPK, start an inquiry, and create a qualified conversation.'],
            ['Separate signals from outcomes', 'Reach and engagement are diagnostic signals; inquiries, proposals, confirmed bookings, and repeat bookings are business outcomes.'],
            ['Improve the weakest step', 'If attention is strong but inquiries are low, fix proof, offer clarity, or the booking path before producing more volume.'],
          ],
        },
        {
          id: 'cosmic-mechanism',
          category: 'Your offer',
          duration: '4 min',
          title: 'How Cosmic Set Architecture can make the offer memorable',
          description: 'A working hypothesis that turns an abstract DJ set into a clear, ownable experience.',
          intro: '“Great atmosphere” is hard to evaluate before an event. A named mechanism can explain how Prohor designs an emotional arc across opening, peak, and closing—making the experience easier to picture and discuss.',
          steps: [
            ['Name the process', 'Describe the set as an intentional three-phase journey instead of a collection of tracks.'],
            ['Show the proof', 'Use real clips and event examples to demonstrate each phase and the audience response.'],
            ['Validate before locking', 'Test the language with Prohor and real buyers; keep it only if it feels authentic and improves understanding.'],
          ],
        },
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
    greeting: document.getElementById('greeting'),
    languageButtons: document.querySelectorAll('[data-language]'),
    projectProgressValue: document.getElementById('project-progress-value'),
    roadmapProgressValue: document.getElementById('roadmap-progress-value'),
    overviewOpenTasks: document.getElementById('overview-open-tasks'),
    overviewMaterialCount: document.getElementById('overview-material-count'),
    sidebarTaskCount: document.getElementById('sidebar-task-count'),
    overviewTaskList: document.getElementById('overview-task-list'),
    fullTaskList: document.getElementById('full-task-list'),
    taskCompletionRatio: document.getElementById('task-completion-ratio'),
    strategyVersion: document.getElementById('strategy-version'),
    strategySource: document.getElementById('strategy-source'),
    strategyPositioning: document.getElementById('strategy-positioning'),
    strategyDirection: document.getElementById('strategy-direction'),
    strategyNorthStar: document.getElementById('strategy-north-star'),
    strategyEvidenceGrid: document.getElementById('strategy-evidence-grid'),
    strategyBrandCompass: document.getElementById('strategy-brand-compass'),
    strategyAudiences: document.getElementById('strategy-audiences'),
    strategyGuardrails: document.getElementById('strategy-guardrails'),
    strategyTruthGrid: document.getElementById('strategy-truth-grid'),
    strategyFunnel: document.getElementById('strategy-funnel'),
    strategyContentPillars: document.getElementById('strategy-content-pillars'),
    strategyDecisionGates: document.getElementById('strategy-decision-gates'),
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

  function readLanguagePreference() {
    try {
      const saved = localStorage.getItem(languageStorageKey);
      return saved === 'en' || saved === 'ru' ? saved : 'ru';
    } catch (error) {
      return 'ru';
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

  function translate(value) {
    const source = String(value);
    if (currentLanguage !== 'ru') return source;

    const dictionary = TRANSLATIONS.ru || {};
    if (dictionary[source]) return dictionary[source];

    if (source.includes(' · ')) {
      return source.split(' · ').map((part) => translate(part)).join(' · ');
    }

    if (source.endsWith(' →')) {
      return `${translate(source.slice(0, -2))} →`;
    }

    const minutes = source.match(/^(\d+(?:–\d+)?) min$/);
    if (minutes) return `${minutes[1]} мин`;

    const readingTime = source.match(/^(\d+(?:–\d+)?) min read$/);
    if (readingTime) return `${readingTime[1]} мин чтения`;

    const date = source.match(/^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December) (\d{4})$/);
    if (date) {
      const months = {
        Jan: 'янв', January: 'января', Feb: 'фев', February: 'февраля', Mar: 'мар', March: 'марта',
        Apr: 'апр', April: 'апреля', May: 'мая', Jun: 'июн', June: 'июня', Jul: 'июл', July: 'июля',
        Aug: 'авг', August: 'августа', Sep: 'сен', September: 'сентября', Oct: 'окт', October: 'октября',
        Nov: 'ноя', November: 'ноября', Dec: 'дек', December: 'декабря',
      };
      return `${date[1]} ${months[date[2]]} ${date[3]}`;
    }

    return source;
  }

  function translateDocument() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node = walker.nextNode();

    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest('script, style, [data-no-translate]') && node.nodeValue.trim()) {
        textNodes.push(node);
      }
      node = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      if (!staticTextSources.has(textNode)) staticTextSources.set(textNode, textNode.nodeValue);
      const source = staticTextSources.get(textNode);
      const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
      textNode.nodeValue = `${match[1]}${translate(match[2])}${match[3]}`;
    });

    document.querySelectorAll('[placeholder], [title], [aria-label]').forEach((element) => {
      if (!attributeSources.has(element)) attributeSources.set(element, {});
      const sources = attributeSources.get(element);

      ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        if (!Object.prototype.hasOwnProperty.call(sources, attribute)) {
          sources[attribute] = element.getAttribute(attribute);
        }
        element.setAttribute(attribute, translate(sources[attribute]));
      });
    });

    document.documentElement.lang = currentLanguage;
    dom.languageButtons.forEach((button) => {
      const isActive = button.dataset.language === currentLanguage;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    const activeNav = document.querySelector('[data-view-target].is-active span:nth-child(2)');
    if (activeNav) dom.currentViewLabel.textContent = activeNav.textContent;
  }

  function setLanguage(language) {
    if (language !== 'ru' && language !== 'en') return;
    currentLanguage = language;
    try {
      localStorage.setItem(languageStorageKey, currentLanguage);
    } catch (error) {
      // The language still changes for this session when storage is unavailable.
    }
    renderAllContent();
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return translate('Good morning');
    if (hour < 18) return translate('Good afternoon');
    return translate('Good evening');
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

    dom.greeting.textContent = getGreeting();
    document.title = currentLanguage === 'ru'
      ? `${client.name} — кабинет клиента 34ForFree7`
      : `${client.name} Client Space — 34ForFree7`;
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
    translateDocument();
    showToast(isDone ? 'Task completed. Nice progress.' : 'Task moved back to open.');
  }

  function taskCheckbox(task) {
    return `
      <input
        class="task-checkbox"
        type="checkbox"
        data-task-checkbox="${escapeHtml(task.id)}"
        aria-label="${escapeHtml(translate('Mark task as completed'))}: ${escapeHtml(translate(task.title))}"
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

  function renderStrategy() {
    const strategy = client.strategy;
    const strategyNav = document.querySelector('[data-view-target="strategy"]');

    if (!strategy) {
      if (strategyNav) strategyNav.hidden = true;
      return;
    }

    dom.strategyVersion.textContent = strategy.version;
    dom.strategySource.textContent = strategy.source;
    dom.strategyPositioning.textContent = strategy.positioning;
    dom.strategyDirection.textContent = strategy.direction;
    dom.strategyNorthStar.textContent = strategy.northStar;

    dom.strategyEvidenceGrid.innerHTML = strategy.evidence.map((item) => `
      <article class="strategy-evidence-card">
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.note)}</small>
      </article>
    `).join('');

    dom.strategyBrandCompass.innerHTML = strategy.brandCompass.map((item) => `
      <article class="brand-compass-card brand-compass-card--${escapeHtml(item.key)}">
        <span>${escapeHtml(item.label)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </article>
    `).join('');

    dom.strategyAudiences.innerHTML = strategy.audiences.map((audience) => `
      <article class="strategy-audience-card">
        <div class="strategy-audience-card__top">
          <span>${escapeHtml(audience.label)}</span>
          <small>${escapeHtml(audience.status)}</small>
        </div>
        <h3>${escapeHtml(audience.title)}</h3>
        <p>${escapeHtml(audience.detail)}</p>
        <strong>${escapeHtml(audience.role)}</strong>
      </article>
    `).join('');

    dom.strategyGuardrails.innerHTML = strategy.guardrails.map((group) => `
      <section class="brand-guardrail brand-guardrail--${escapeHtml(group.key)}">
        <span>${escapeHtml(group.label)}</span>
        <ul>
          ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>
    `).join('');

    dom.strategyTruthGrid.innerHTML = strategy.truthGroups.map((group) => `
      <article class="strategy-truth-card strategy-truth-card--${escapeHtml(group.key)}">
        <div class="strategy-truth-card__heading">
          <span class="truth-status-dot"></span>
          <div>
            <h3>${escapeHtml(group.label)}</h3>
            <p>${escapeHtml(group.description)}</p>
          </div>
        </div>
        <ul>
          ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    `).join('');

    dom.strategyFunnel.innerHTML = strategy.funnel.map((step, index) => `
      <article class="funnel-step">
        <div class="funnel-step__top">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <small>${escapeHtml(step.signal)}</small>
        </div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.detail)}</p>
      </article>
    `).join('');

    dom.strategyContentPillars.innerHTML = strategy.contentPillars.map((pillar) => `
      <article class="strategy-pillar">
        <span class="strategy-pillar__number">${escapeHtml(pillar.number)}</span>
        <div>
          <span class="strategy-pillar__role">${escapeHtml(pillar.role)}</span>
          <h3>${escapeHtml(pillar.title)}</h3>
          <p>${escapeHtml(pillar.detail)}</p>
        </div>
      </article>
    `).join('');

    dom.strategyDecisionGates.innerHTML = strategy.gates.map((gate) => `
      <article class="strategy-gate strategy-gate--${escapeHtml(gate.status)}">
        <span>${escapeHtml(gate.label)}</span>
        <div>
          <h3>${escapeHtml(gate.title)}</h3>
          <p>${escapeHtml(gate.detail)}</p>
        </div>
      </article>
    `).join('');
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
    translateDocument();
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
        translateDocument();
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
      date: new Intl.DateTimeFormat(currentLanguage === 'ru' ? 'ru-RU' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    });
    localStorage.setItem(questionStorageKey, JSON.stringify(savedQuestions));
    dom.questionForm.reset();
    renderQuestions();
    translateDocument();
    showToast('Question saved on this device.');
  }

  function showToast(message) {
    dom.toast.textContent = translate(message);
    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 2800);
  }

  function bindEvents() {
    dom.languageButtons.forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.language));
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
        translateDocument();
      });
    });

    document.addEventListener('click', (event) => {
      const viewControl = event.target.closest('[data-view-target], [data-view-link]');
      if (viewControl) switchView(viewControl.dataset.viewTarget || viewControl.dataset.viewLink);

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

  function renderAllContent() {
    applyClientContent();
    renderTasks();
    renderStrategy();
    renderRoadmap();
    renderMaterials();
    renderKnowledge();
    renderForms();
    renderQuestions();
    translateDocument();
  }

  function init() {
    renderAllContent();
    bindEvents();

    const initialView = window.location.hash.replace('#', '');
    if (initialView && document.querySelector(`[data-view="${initialView}"]`)) {
      switchView(initialView);
    }
  }

  init();
})();
