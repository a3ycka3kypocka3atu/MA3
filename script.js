/* ═══════════════════════════════════════════════════════════
   MA3 AGENCY 3.0 — JAVASCRIPT
   Video cycling · Popups · Interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const LANG_STORAGE_KEY = 'ma3-language';
  const supportedLangs = ['en', 'cs', 'uk', 'ru'];
  let currentLang = supportedLangs.includes(localStorage.getItem(LANG_STORAGE_KEY))
    ? localStorage.getItem(LANG_STORAGE_KEY)
    : 'en';

  const servicePrices = [
    ['100€–300€', '500€–1500€'],
    ['150€–500€', '800€–2500€'],
    ['1500€–4000€', '5000€–12000€'],
    ['150€–500€', '500€–2000€'],
    ['100€–1000€', '1500€–4000€'],
    ['200€–700€', '700€–3000€'],
    ['300€–1000€', '1000€–5000€'],
    ['300€–1000€', '2000€–10000€'],
  ];

  const translations = {
    en: {
      htmlLang: 'en',
      metaDescription: 'MA3 — AI-native web, growth & product studio. Three agencies, one integrated service system.',
      pageTitle: 'MA3 — Agency 3.0',
      aria: {
        language: 'Language',
        chooseAgency: 'Choose Agency',
        explore: 'Explore',
        close: 'Close',
      },
      agencies: [
        ['Regular Business Agency', 'Stability · Reliability · Results'],
        ['Digital & Startups Agency', 'Technology · Innovation · Scale'],
        ['Ethic & Conscious Agency', 'Meaning · Ethics · Harmony'],
      ],
      sections: {
        services: 'Our Services',
        bot: 'Agency Bot',
        projects: 'Our Projects',
        cases: 'Our Projects',
      },
      footer: 'AI-native web, growth & product studio',
      services: {
        title: 'Our Services',
        subtitle: 'We are an AI-native web, growth & product studio. We build ready-made systems: from market analysis and idea generation to a fully working product and its launch.',
        badge: 'Early client price',
        ourPrice: 'Our Price',
        marketPrice: 'Market Price',
        modalOurPrice: 'Our Current Price',
        modalMarketPrice: 'Regular Market Price',
        note: [
          'We already work with experienced specialists and modern technologies, but currently focus on building long-term partnerships and first case studies.',
          'Because of that we intentionally keep pricing lower than average market rates.',
        ],
        items: [
          {
            title: 'Marketing Strategy and Client DNA',
            short: 'Market research, competitor analysis, client portrait, offer logic, and funnel economics.',
            detail: 'We define the strategic base for your growth: market research, competitor landscape, client portrait, offer logic, funnel economics, and the exact messaging direction your product needs before traffic or design work begins.',
          },
          {
            title: 'Sites and Landings',
            short: 'Structure, texts, design, frontend development, lead generation, and basic SEO preparation.',
            detail: 'We create fast, modern landing pages and websites with structure, copy, design, frontend development, lead capture, and basic SEO preparation built around conversion instead of decoration.',
          },
          {
            title: 'MVP and Product Development',
            short: 'React/Vite interfaces, Supabase integration, personal cabinets, questionnaires, databases, and core product logic.',
            detail: 'We build lean but serious MVPs: product interfaces, personal cabinets, questionnaires, Supabase-backed data flows, sharing logic, and the core functionality needed to validate a product in the real world.',
          },
          {
            title: 'Telegram Onboarding and Bots',
            short: 'Telegram bot flows, forms, user profiles, quick user login, and lead generation.',
            detail: 'We design Telegram bot flows for onboarding, lead capture, user profiles, forms, quick access logic, and smooth communication between your audience and your internal process.',
          },
          {
            title: 'Funnel and Analytics',
            short: 'Client journey audit, CTA placement, tracking checklists, identifying conversion drop points, and optimization planning.',
            detail: 'We audit and improve the path from first contact to conversion: CTA logic, funnel weak points, tracking checklist, client journey, and practical next steps for measurable growth.',
          },
          {
            title: 'Integrations and Databases',
            short: 'Data tables, profiles, matching logic, structured data flows, and simple admin logics.',
            detail: 'We connect the operational layer behind your product: structured databases, profiles, matching logic, simple admin flows, and clean data movement between tools.',
          },
          {
            title: 'Automations',
            short: 'n8n workflows, CRM synchronization, and automated reporting flows.',
            detail: 'We automate repeated work with n8n, CRM synchronization, internal notifications, data routing, and reporting flows so your team spends less time moving information by hand.',
          },
          {
            title: 'Video Automation',
            short: 'Remotion/code-driven video for personalized and scalable creatives.',
            detail: 'We create code-driven video systems for personalized creatives, repeated content formats, offer videos, and scalable visual production using lightweight automation workflows.',
          },
        ],
      },
      projectsTitle: 'Our Projects',
      projects: [
        ['Platform', 'Networking Platform', 'A collaboration and networking platform designed for conscious individuals who lead a healthy lifestyle, care about nature, and hold a proactive social stance. It serves as foundational networking infrastructure with an internal fund for supporting and developing new startups.', 'Open Platform →'],
        ['AI Tool', 'AI Personal Cabinet', 'A dedicated tool for structuring information and managing personal or team projects. It includes advanced AI assistants for workflow optimization and robust sharing inside a collaborative system.', 'Open Project →'],
        ['Bot', 'Networking & Dating Bot', 'An advanced Telegram bot for dating, personal dossiers, and relationship tracking. It includes secure data storage, deep psychological analysis, and game mechanics for friends and larger groups.', 'Open Bot →'],
        ['Education', 'Online/Offline School', 'An educational project connecting online learning infrastructure with physical meetings and partner events in Prague. The focus is psychological and physical health, self-awareness, spirituality, and ecological thinking.', 'Visit School →'],
      ],
      casesTitle: 'Our Projects',
      cases: [
        ['Conscious Platform', 'Santiago Studio Prague', 'A platform for masters, spiritual practitioners, alternative and natural services, workshops, retreats, and conscious community events. Santiago connects this audience with the people, practices, and gatherings of their world.', 'Open Project →'],
        ['Health & Lifestyle', 'Detox Way of Life', 'A motivational platform for better living, combining Ayurveda, evidence-based nutrition, and bioflora optimization as a foundation for personal growth.', 'Visit Website →'],
        ['E-Commerce', 'Detox Only', 'A specialized product landing page and ecosystem for premium detox products and related health services.', 'View Product →'],
        ['Personal Brand', 'Meditation & Coaching', 'A complete school system and personal brand infrastructure for a meditation expert, including coaching formats and event management.', 'Join Event →'],
      ],
    },
    cs: {
      htmlLang: 'cs',
      metaDescription: 'MA3 — AI-native studio pro web, růst a produkt. Tři agentury, jeden propojený systém služeb.',
      pageTitle: 'MA3 — Agentura 3.0',
      aria: {
        language: 'Jazyk',
        chooseAgency: 'Vyberte agenturu',
        explore: 'Prozkoumat',
        close: 'Zavřít',
      },
      agencies: [
        ['Regular Business Agency', 'Stabilita · Spolehlivost · Výsledek'],
        ['Digital & Startups Agency', 'Technologie · Inovace · Škálování'],
        ['Ethic & Conscious Agency', 'Smysl · Etika · Harmonie'],
      ],
      sections: {
        services: 'Naše služby',
        bot: 'Agency Bot',
        projects: 'Naše projekty',
        cases: 'Naše projekty',
      },
      footer: 'AI-native studio pro web, růst a produkt',
      services: {
        title: 'Naše služby',
        subtitle: 'Jsme AI-native studio pro web, růst a produkt. Stavíme hotové systémy: od analýzy trhu a formulace nápadu až po funkční produkt a jeho uvedení na trh.',
        badge: 'Cena pro první klienty',
        ourPrice: 'Naše cena',
        marketPrice: 'Tržní cena',
        modalOurPrice: 'Naše aktuální cena',
        modalMarketPrice: 'Běžná tržní cena',
        note: [
          'Pracujeme se zkušenými specialisty a moderními technologiemi, zároveň se teď soustředíme na dlouhodobá partnerství a první silné case studies.',
          'Proto držíme ceny záměrně níže, než je běžný průměr na trhu.',
        ],
        items: [
          {
            title: 'Marketingová strategie a klientské DNA',
            short: 'Analýza trhu, konkurence, portrét klienta, logika nabídky a ekonomika funnelu.',
            detail: 'Definujeme strategický základ pro růst: trh, konkurenci, profil ideálního klienta, logiku nabídky, ekonomiku funnelu a přesné sdělení, které produkt potřebuje ještě před designem nebo kampaněmi.',
          },
          {
            title: 'Weby a landing pages',
            short: 'Struktura, texty, design, frontend, sběr leadů a základní SEO příprava.',
            detail: 'Vytváříme rychlé a moderní weby i landing pages: strukturu, copy, design, frontend, lead capture a základní SEO přípravu s důrazem na konverzi, ne na prázdnou dekoraci.',
          },
          {
            title: 'MVP a produktový vývoj',
            short: 'React/Vite rozhraní, Supabase, osobní kabinety, dotazníky, databáze a produktová logika.',
            detail: 'Stavíme štíhlá, ale plnohodnotná MVP: produktová rozhraní, osobní kabinety, dotazníky, datové vrstvy v Supabase, sdílení a klíčovou funkcionalitu potřebnou pro reálné ověření produktu.',
          },
          {
            title: 'Telegram onboarding a boti',
            short: 'Telegram flow, formuláře, uživatelské profily, rychlé přihlášení a generování leadů.',
            detail: 'Navrhujeme Telegram boty pro onboarding, sběr leadů, profily uživatelů, formuláře, rychlý přístup a plynulé propojení mezi publikem a interním procesem.',
          },
          {
            title: 'Funnel a analytika',
            short: 'Audit zákaznické cesty, CTA, tracking, slabá místa konverzí a plán optimalizace.',
            detail: 'Auditujeme a zlepšujeme cestu od prvního kontaktu ke konverzi: logiku CTA, slabá místa funnelu, tracking checklist, zákaznickou cestu a praktické kroky pro měřitelný růst.',
          },
          {
            title: 'Integrace a databáze',
            short: 'Datové tabulky, profily, matching logika, strukturované toky a jednoduchá administrace.',
            detail: 'Propojujeme provozní vrstvu produktu: strukturované databáze, profily, matching logiku, jednoduchou administraci a čistý pohyb dat mezi nástroji.',
          },
          {
            title: 'Automatizace',
            short: 'n8n workflow, synchronizace CRM a automatizované reportovací procesy.',
            detail: 'Automatizujeme opakovanou práci pomocí n8n, CRM synchronizací, interních notifikací, datového routingu a reportingu, aby tým nemusel přesouvat informace ručně.',
          },
          {
            title: 'Video automatizace',
            short: 'Remotion a code-driven video pro personalizované a škálovatelné kreativy.',
            detail: 'Vytváříme code-driven video systémy pro personalizované kreativy, opakovatelné formáty, offer videa a škálovatelnou vizuální produkci pomocí lehkých automatizačních workflow.',
          },
        ],
      },
      projectsTitle: 'Naše projekty',
      projects: [
        ['Platforma', 'Networking Platform', 'Platforma pro spolupráci a networking pro vědomé lidi se zdravým životním stylem, vztahem k přírodě a aktivním společenským postojem. Funguje jako základní networkingová infrastruktura s interním fondem na podporu nových startupů.', 'Otevřít platformu →'],
        ['AI nástroj', 'AI Personal Cabinet', 'Nástroj pro strukturování informací a řízení osobních i týmových projektů. Obsahuje pokročilé AI asistenty pro optimalizaci práce a bezpečné sdílení v rámci spolupráce.', 'Otevřít projekt →'],
        ['Bot', 'Networking & Dating Bot', 'Pokročilý Telegram bot pro seznamování, osobní profily a práci se vztahy. Obsahuje bezpečné uchování dat, hlubší psychologickou analýzu a herní mechaniky pro přátele i větší skupiny.', 'Otevřít bota →'],
        ['Vzdělávání', 'Online/Offline School', 'Vzdělávací projekt propojující online infrastrukturu s fyzickými setkáními a partnerskými akcemi v Praze. Zaměřuje se na psychické i fyzické zdraví, sebeuvědomění, spiritualitu a ekologické myšlení.', 'Navštívit školu →'],
      ],
      casesTitle: 'Naše projekty',
      cases: [
        ['Vědomá platforma', 'Santiago Studio Prague', 'Platforma pro mistry, duchovní průvodce, alternativní a přírodní služby, workshopy, retreaty a komunitní akce. Santiago propojuje tuto cílovou skupinu s lidmi, praxemi a událostmi z jejího světa.', 'Otevřít projekt →'],
        ['Zdraví & Lifestyle', 'Detox Way of Life', 'Motivační platforma pro lepší život, která kombinuje Ayurvedu, vědecky podloženou výživu a optimalizaci bioflóry jako základ osobního růstu.', 'Navštívit web →'],
        ['E-commerce', 'Detox Only', 'Specializovaný produktový landing page a ekosystém pro prémiové detox produkty a související zdravotní služby.', 'Zobrazit produkt →'],
        ['Osobní brand', 'Meditation & Coaching', 'Kompletní školní systém a osobní brand pro odbornici na meditaci, včetně coachingové infrastruktury a správy eventů.', 'Připojit se →'],
      ],
    },
    uk: {
      htmlLang: 'uk',
      metaDescription: 'MA3 — AI-native студія вебу, росту та продукту. Три агенції, одна цілісна система послуг.',
      pageTitle: 'MA3 — Агенція 3.0',
      aria: {
        language: 'Мова',
        chooseAgency: 'Виберіть агенцію',
        explore: 'Навігація',
        close: 'Закрити',
      },
      agencies: [
        ['Regular Business Agency', 'Стабільність · Надійність · Результат'],
        ['Digital & Startups Agency', 'Технології · Інновації · Масштабування'],
        ['Ethic & Conscious Agency', 'Сенс · Етика · Гармонія'],
      ],
      sections: {
        services: 'Наші послуги',
        bot: 'Agency Bot',
        projects: 'Наші проєкти',
        cases: 'Наші проєкти',
      },
      footer: 'AI-native студія вебу, росту та продукту',
      services: {
        title: 'Наші послуги',
        subtitle: 'Ми AI-native студія вебу, росту та продукту. Створюємо готові системи: від аналізу ринку й формування ідеї до робочого продукту та його запуску.',
        badge: 'Ціна для перших клієнтів',
        ourPrice: 'Наша ціна',
        marketPrice: 'Ринкова ціна',
        modalOurPrice: 'Наша поточна ціна',
        modalMarketPrice: 'Звичайна ринкова ціна',
        note: [
          'Ми вже працюємо з досвідченими спеціалістами та сучасними технологіями, але зараз фокусуємося на довгострокових партнерствах і перших сильних кейсах.',
          'Саме тому ми свідомо тримаємо ціни нижчими за середні ринкові.',
        ],
        items: [
          {
            title: 'Маркетингова стратегія та ДНК клієнта',
            short: 'Дослідження ринку, аналіз конкурентів, портрет клієнта, логіка офера та економіка воронки.',
            detail: 'Формуємо стратегічну основу для росту: ринок, конкурентне поле, портрет ідеального клієнта, логіку офера, економіку воронки та точне повідомлення, яке продукт потребує ще до дизайну або реклами.',
          },
          {
            title: 'Сайти та лендінги',
            short: 'Структура, тексти, дизайн, frontend-розробка, збір лідів і базова SEO-підготовка.',
            detail: 'Створюємо швидкі сучасні сайти та лендінги: структуру, тексти, дизайн, frontend, збір лідів і базову SEO-підготовку з фокусом на конверсію, а не на порожню декоративність.',
          },
          {
            title: 'MVP та продуктова розробка',
            short: 'React/Vite інтерфейси, Supabase, особисті кабінети, анкети, бази даних і ключова логіка продукту.',
            detail: 'Будуємо легкі, але повноцінні MVP: продуктові інтерфейси, особисті кабінети, анкети, бази даних у Supabase, логіку спільного доступу та функції, потрібні для реальної перевірки продукту.',
          },
          {
            title: 'Telegram onboarding і боти',
            short: 'Telegram-сценарії, форми, профілі користувачів, швидкий доступ і генерація лідів.',
            detail: 'Проєктуємо Telegram-ботів для onboarding, збору лідів, профілів користувачів, форм, швидкого доступу та плавного зв’язку між аудиторією і внутрішніми процесами.',
          },
          {
            title: 'Воронка та аналітика',
            short: 'Аудит клієнтського шляху, CTA, tracking checklist, пошук точок втрати конверсії та план оптимізації.',
            detail: 'Аудитуємо й покращуємо шлях від першого контакту до конверсії: логіку CTA, слабкі місця воронки, tracking checklist, клієнтський шлях і практичні кроки для вимірюваного росту.',
          },
          {
            title: 'Інтеграції та бази даних',
            short: 'Таблиці даних, профілі, matching-логіка, структуровані потоки та проста адміністративна логіка.',
            detail: 'З’єднуємо операційний шар продукту: структуровані бази даних, профілі, matching-логіку, просту адмінку та чистий рух даних між інструментами.',
          },
          {
            title: 'Автоматизації',
            short: 'n8n workflow, синхронізація CRM та автоматизовані звітні процеси.',
            detail: 'Автоматизуємо повторювану роботу через n8n, CRM-синхронізації, внутрішні сповіщення, маршрутизацію даних і звітність, щоб команда не переносила інформацію вручну.',
          },
          {
            title: 'Відеоавтоматизація',
            short: 'Remotion і code-driven video для персоналізованих та масштабованих креативів.',
            detail: 'Створюємо code-driven video системи для персоналізованих креативів, повторюваних форматів, offer-відео та масштабованого візуального виробництва через легкі automation workflows.',
          },
        ],
      },
      projectsTitle: 'Наші проєкти',
      projects: [
        ['Платформа', 'Networking Platform', 'Платформа для співпраці й нетворкінгу для свідомих людей зі здоровим способом життя, турботою про природу та активною соціальною позицією. Вона працює як базова інфраструктура нетворкінгу з внутрішнім фондом підтримки нових стартапів.', 'Відкрити платформу →'],
        ['AI-інструмент', 'AI Personal Cabinet', 'Інструмент для структурування інформації та зручного управління особистими й командними проєктами. Має AI-асистентів для оптимізації процесів і надійне спільне використання в колаборативній системі.', 'Відкрити проєкт →'],
        ['Бот', 'Networking & Dating Bot', 'Просунутий Telegram-бот для знайомств, персональних досьє та роботи зі стосунками. Має безпечне збереження даних, глибшу психологічну аналітику й ігрові механіки для друзів та більших груп.', 'Відкрити бота →'],
        ['Освіта', 'Online/Offline School', 'Освітній проєкт, що поєднує онлайн-інфраструктуру з живими зустрічами та партнерськими подіями у Празі. Фокус — психічне й фізичне здоров’я, самоусвідомлення, духовність та екологічне мислення.', 'Перейти до школи →'],
      ],
      casesTitle: 'Наші проєкти',
      cases: [
        ['Свідома платформа', 'Santiago Studio Prague', 'Платформа для майстрів, духовних практиків, альтернативних і природних послуг, воркшопів, ретритів та подій спільноти. Santiago поєднує цю аудиторію з людьми, практиками й подіями її світу.', 'Відкрити проєкт →'],
        ['Здоров’я & Lifestyle', 'Detox Way of Life', 'Мотиваційна платформа для кращого життя, що поєднує Аюрведу, науково обґрунтоване харчування й оптимізацію біофлори як основу особистого росту.', 'Перейти на сайт →'],
        ['E-commerce', 'Detox Only', 'Спеціалізований продуктовий landing page та екосистема для преміальних detox-продуктів і пов’язаних health-послуг.', 'Переглянути продукт →'],
        ['Особистий бренд', 'Meditation & Coaching', 'Комплексна система школи й особистого бренду для експертки з медитації, включно з coaching-інфраструктурою та управлінням подіями.', 'Приєднатися →'],
      ],
    },
    ru: {
      htmlLang: 'ru',
      metaDescription: 'MA3 — AI-native студия веба, роста и продукта. Три агентства, одна цельная система услуг.',
      pageTitle: 'MA3 — Агентство 3.0',
      aria: {
        language: 'Язык',
        chooseAgency: 'Выберите агентство',
        explore: 'Навигация',
        close: 'Закрыть',
      },
      agencies: [
        ['Regular Business Agency', 'Стабильность · Надёжность · Результат'],
        ['Digital & Startups Agency', 'Технологии · Инновации · Масштабирование'],
        ['Ethic & Conscious Agency', 'Смысл · Этика · Гармония'],
      ],
      sections: {
        services: 'Наши услуги',
        bot: 'Agency Bot',
        projects: 'Наши проекты',
        cases: 'Наши проекты',
      },
      footer: 'AI-native студия веба, роста и продукта',
      services: {
        title: 'Наши услуги',
        subtitle: 'Мы AI-native студия веба, роста и продукта. Собираем готовые системы: от анализа рынка и формулировки идеи до рабочего продукта и его запуска.',
        badge: 'Цена для первых клиентов',
        ourPrice: 'Наша цена',
        marketPrice: 'Рыночная цена',
        modalOurPrice: 'Наша текущая цена',
        modalMarketPrice: 'Обычная рыночная цена',
        note: [
          'Мы уже работаем с опытными специалистами и современными технологиями, но сейчас сфокусированы на долгосрочных партнёрствах и первых сильных кейсах.',
          'Поэтому мы осознанно держим цены ниже среднего уровня рынка.',
        ],
        items: [
          {
            title: 'Маркетинговая стратегия и ДНК клиента',
            short: 'Исследование рынка, анализ конкурентов, портрет клиента, логика оффера и экономика воронки.',
            detail: 'Формируем стратегическую основу для роста: рынок, конкурентное поле, профиль идеального клиента, логику оффера, экономику воронки и точное сообщение, которое продукту нужно ещё до дизайна или рекламы.',
          },
          {
            title: 'Сайты и лендинги',
            short: 'Структура, тексты, дизайн, frontend-разработка, сбор лидов и базовая SEO-подготовка.',
            detail: 'Создаём быстрые современные сайты и лендинги: структуру, тексты, дизайн, frontend, сбор лидов и базовую SEO-подготовку с фокусом на конверсию, а не на пустую декоративность.',
          },
          {
            title: 'MVP и продуктовая разработка',
            short: 'React/Vite интерфейсы, Supabase, личные кабинеты, анкеты, базы данных и ключевая логика продукта.',
            detail: 'Собираем лёгкие, но полноценные MVP: продуктовые интерфейсы, личные кабинеты, анкеты, базы данных в Supabase, логику совместного доступа и функции, нужные для реальной проверки продукта.',
          },
          {
            title: 'Telegram onboarding и боты',
            short: 'Telegram-сценарии, формы, профили пользователей, быстрый доступ и генерация лидов.',
            detail: 'Проектируем Telegram-ботов для onboarding, сбора лидов, профилей пользователей, форм, быстрого доступа и плавной связи между аудиторией и внутренними процессами.',
          },
          {
            title: 'Воронка и аналитика',
            short: 'Аудит клиентского пути, CTA, tracking checklist, поиск точек потери конверсии и план оптимизации.',
            detail: 'Аудитируем и улучшаем путь от первого контакта до конверсии: логику CTA, слабые места воронки, tracking checklist, клиентский путь и практические шаги для измеримого роста.',
          },
          {
            title: 'Интеграции и базы данных',
            short: 'Таблицы данных, профили, matching-логика, структурированные потоки и простая административная логика.',
            detail: 'Соединяем операционный слой продукта: структурированные базы данных, профили, matching-логику, простую админку и чистое движение данных между инструментами.',
          },
          {
            title: 'Автоматизации',
            short: 'n8n workflow, синхронизация CRM и автоматизированные отчётные процессы.',
            detail: 'Автоматизируем повторяющуюся работу через n8n, CRM-синхронизации, внутренние уведомления, маршрутизацию данных и отчётность, чтобы команда не переносила информацию вручную.',
          },
          {
            title: 'Видеоавтоматизация',
            short: 'Remotion и code-driven video для персонализированных и масштабируемых креативов.',
            detail: 'Создаём code-driven video системы для персонализированных креативов, повторяемых форматов, offer-видео и масштабируемого визуального производства через лёгкие automation workflows.',
          },
        ],
      },
      projectsTitle: 'Наши проекты',
      projects: [
        ['Платформа', 'Networking Platform', 'Платформа для сотрудничества и нетворкинга для осознанных людей со здоровым образом жизни, заботой о природе и активной социальной позицией. Работает как базовая инфраструктура нетворкинга с внутренним фондом поддержки новых стартапов.', 'Открыть платформу →'],
        ['AI-инструмент', 'AI Personal Cabinet', 'Инструмент для структурирования информации и удобного управления личными и командными проектами. Включает AI-ассистентов для оптимизации процессов и надёжное совместное использование внутри коллаборативной системы.', 'Открыть проект →'],
        ['Бот', 'Networking & Dating Bot', 'Продвинутый Telegram-бот для знакомств, персональных досье и работы с отношениями. Включает безопасное хранение данных, глубокую психологическую аналитику и игровые механики для друзей и больших групп.', 'Открыть бота →'],
        ['Образование', 'Online/Offline School', 'Образовательный проект, соединяющий онлайн-инфраструктуру с живыми встречами и партнёрскими событиями в Праге. Фокус — психическое и физическое здоровье, самоосознанность, духовность и экологическое мышление.', 'Перейти к школе →'],
      ],
      casesTitle: 'Наши проекты',
      cases: [
        ['Осознанная платформа', 'Santiago Studio Prague', 'Платформа для мастеров, духовных практиков, альтернативных и природных услуг, воркшопов, ретритов и событий сообщества. Santiago соединяет эту аудиторию с людьми, практиками и событиями её мира.', 'Открыть проект →'],
        ['Здоровье & Lifestyle', 'Detox Way of Life', 'Мотивационная платформа для лучшей жизни, которая объединяет Аюрведу, научно обоснованное питание и оптимизацию биофлоры как основу личного роста.', 'Перейти на сайт →'],
        ['E-commerce', 'Detox Only', 'Специализированный продуктовый landing page и экосистема для премиальных detox-продуктов и связанных health-услуг.', 'Смотреть продукт →'],
        ['Личный бренд', 'Meditation & Coaching', 'Комплексная система школы и личного бренда для эксперта по медитации, включая coaching-инфраструктуру и управление событиями.', 'Присоединиться →'],
      ],
    },
  };

  // ── VIDEO BACKGROUND CYCLING ──
  const videos = document.querySelectorAll('.bg-video');
  let currentVideoIndex = 0;

  function initVideos() {
    // Force mute and playsinline for strict browsers (fixes Vercel/iOS autoplay blocks)
    videos.forEach(v => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });

    // Start first video
    const first = videos[0];
    first.classList.add('active');
    first.play().catch(e => console.log('Autoplay blocked:', e));

    // When each video ends, crossfade to the next
    videos.forEach((video, index) => {
      video.addEventListener('ended', () => {
        // Fade out current
        video.classList.remove('active');

        // Move to next video (loop around)
        currentVideoIndex = (index + 1) % videos.length;
        const next = videos[currentVideoIndex];

        // Reset to start and play
        next.currentTime = 0;
        next.play().catch(() => {});
        next.classList.add('active');
      });
    });
  }

  // Autoplay on user interaction fallback (some browsers block autoplay until user interacts)
  // Listen to ANY interaction to trigger playback (fixes strict mobile/Vercel policies)
  const interactionEvents = ['click', 'touchstart', 'mousemove', 'scroll'];
  const triggerPlayback = () => {
    const active = videos[currentVideoIndex];
    if (active && active.paused) {
      active.muted = true; // Force mute again just in case
      active.playsInline = true;
      const playPromise = active.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Success! Now we can safely remove the listeners
          interactionEvents.forEach(e => document.removeEventListener(e, triggerPlayback));
        }).catch(() => {
          // Failed (e.g., interaction wasn't a strict enough gesture). Keep listening.
        });
      }
    } else if (active && !active.paused) {
      // Already playing naturally, remove listeners
      interactionEvents.forEach(e => document.removeEventListener(e, triggerPlayback));
    }
  };
  interactionEvents.forEach(e => document.addEventListener(e, triggerPlayback, { passive: true }));

  // ── POPUP MANAGEMENT ──
  const popupServices = document.getElementById('popup-services');
  const popupProjects = document.getElementById('popup-projects');
  const popupCases = document.getElementById('popup-cases');
  const serviceDetail = document.getElementById('service-detail');

  const btnServices = document.getElementById('btn-services');
  const btnProjects = document.getElementById('btn-projects');
  const btnCases = document.getElementById('btn-cases');

  const closeServices = document.getElementById('close-services');
  const closeProjects = document.getElementById('close-projects');
  const closeCases = document.getElementById('close-cases');
  const closeServiceDetail = document.getElementById('close-service-detail');

  const serviceDetailTitle = document.getElementById('service-detail-title');
  const serviceDetailDescription = document.getElementById('service-detail-description');
  const serviceDetailPrice = document.getElementById('service-detail-price');
  const serviceDetailMarket = document.getElementById('service-detail-market');
  const languageSwitcher = document.getElementById('language-switcher');
  const langButtons = document.querySelectorAll('.lang-btn');
  const metaDescription = document.querySelector('meta[name="description"]');

  function setText(selector, text, root = document) {
    const element = root.querySelector(selector);
    if (element) element.textContent = text;
  }

  function setServiceCard(card, item, price, labels, index) {
    card.dataset.serviceIndex = String(index);
    card.dataset.serviceTitle = item.title;
    card.dataset.serviceDetail = item.detail;
    card.dataset.servicePrice = price[0];
    card.dataset.serviceMarket = price[1];
    card.setAttribute('aria-label', `${item.title}. ${item.short}. ${labels.ourPrice}: ${price[0]}. ${labels.marketPrice}: ${price[1]}.`);

    setText('.service-card__badge', labels.badge, card);
    setText('h3', item.title, card);
    setText('p', item.short, card);
    setText('.service-price--ours span', labels.ourPrice, card);
    setText('.service-price--ours strong', price[0], card);
    setText('.service-price--market span', labels.marketPrice, card);
    setText('.service-price--market strong', price[1], card);
  }

  function setProjectCard(card, item) {
    const [badge, title, description, linkText] = item;
    setText('.project-card__badge', badge, card);
    setText('h3', title, card);
    setText('p', description, card);
    setText('.project-link', linkText, card);
  }

  function refreshOpenServiceDetail() {
    if (!serviceDetail || !serviceDetail.classList.contains('open')) return;
    const index = Number(serviceDetail.dataset.serviceIndex || 0);
    renderServiceDetail(index);
  }

  function renderServiceDetail(index) {
    const t = translations[currentLang];
    const item = t.services.items[index];
    const price = servicePrices[index];
    if (!serviceDetail || !item || !price) return;

    serviceDetail.dataset.serviceIndex = String(index);
    serviceDetail.setAttribute('aria-label', item.title);
    serviceDetailTitle.textContent = item.title;
    serviceDetailDescription.textContent = item.detail;
    serviceDetailPrice.textContent = price[0];
    serviceDetailMarket.textContent = price[1];
    setText('.service-detail__badge', t.services.badge, serviceDetail);
    setText('.service-detail-price--ours span', t.services.modalOurPrice, serviceDetail);
    setText('.service-detail-price--market span', t.services.modalMarketPrice, serviceDetail);
    const noteParagraphs = serviceDetail.querySelectorAll('.service-detail__note p');
    noteParagraphs.forEach((paragraph, noteIndex) => {
      paragraph.textContent = t.services.note[noteIndex] || '';
    });
  }

  function applyLanguage(lang) {
    currentLang = supportedLangs.includes(lang) ? lang : 'en';
    const t = translations[currentLang];
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);

    document.documentElement.lang = t.htmlLang;
    document.title = t.pageTitle;
    if (metaDescription) metaDescription.setAttribute('content', t.metaDescription);

    if (languageSwitcher) languageSwitcher.setAttribute('aria-label', t.aria.language);
    langButtons.forEach(button => {
      const isActive = button.dataset.lang === currentLang;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    const agencySection = document.getElementById('agency-buttons');
    const centerSection = document.getElementById('center-buttons');
    if (agencySection) agencySection.setAttribute('aria-label', t.aria.chooseAgency);
    if (centerSection) centerSection.setAttribute('aria-label', t.aria.explore);

    document.querySelectorAll('.agency-btn').forEach((button, index) => {
      const agency = t.agencies[index];
      if (!agency) return;
      setText('.agency-btn__title', agency[0], button);
      setText('.agency-btn__subtitle', agency[1], button);
      button.setAttribute('aria-label', `${agency[0]}. ${agency[1]}`);
    });

    setText('#btn-services .section-btn__text', t.sections.services);
    setText('#btn-bot .section-btn__text', t.sections.bot);
    setText('#btn-projects .section-btn__text', t.sections.projects);
    setText('#btn-cases .section-btn__text', t.sections.cases);
    setText('.brand-tagline', t.footer);

    [popupServices, popupProjects, popupCases].forEach(popup => {
      if (popup) popup.setAttribute('aria-label', popup === popupServices ? t.services.title : popup === popupProjects ? t.projectsTitle : t.casesTitle);
    });
    document.querySelectorAll('.popup-close').forEach(button => {
      button.setAttribute('aria-label', t.aria.close);
    });

    setText('#popup-services .popup-title', t.services.title);
    setText('#popup-services .popup-subtitle', t.services.subtitle);
    document.querySelectorAll('.service-card').forEach((card, index) => {
      setServiceCard(card, t.services.items[index], servicePrices[index], t.services, index);
    });

    setText('#popup-projects .popup-title', t.projectsTitle);
    document.querySelectorAll('#popup-projects .project-card').forEach((card, index) => {
      setProjectCard(card, t.projects[index]);
    });

    setText('#popup-cases .popup-title', t.casesTitle);
    document.querySelectorAll('#popup-cases .project-card').forEach((card, index) => {
      setProjectCard(card, t.cases[index]);
    });

    refreshOpenServiceDetail();
  }

  function openPopup(popup) {
    // Close any other open popups first
    [popupServices, popupProjects, popupCases].forEach(p => {
      if (p && p !== popup) closePopup(p);
    });
    popup.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePopup(popup) {
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden'; // keep body overflow hidden (fullscreen page)
  }

  function openServiceDetail(card) {
    if (!serviceDetail) return;
    const index = Number(card.dataset.serviceIndex || 0);
    renderServiceDetail(index);

    serviceDetail.classList.add('open');
    serviceDetail.setAttribute('aria-hidden', 'false');
  }

  function closeServiceDetailPopup() {
    if (!serviceDetail) return;
    serviceDetail.classList.remove('open');
    serviceDetail.setAttribute('aria-hidden', 'true');
  }

  btnServices.addEventListener('click', () => openPopup(popupServices));
  btnProjects.addEventListener('click', () => openPopup(popupProjects));
  if (btnCases) btnCases.addEventListener('click', () => openPopup(popupCases));

  closeServices.addEventListener('click', () => closePopup(popupServices));
  closeProjects.addEventListener('click', () => closePopup(popupProjects));
  if (closeCases) closeCases.addEventListener('click', () => closePopup(popupCases));
  if (closeServiceDetail) closeServiceDetail.addEventListener('click', closeServiceDetailPopup);

  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      applyLanguage(button.dataset.lang);
    });
  });

  // Close on backdrop click
  [popupServices, popupProjects, popupCases].forEach(popup => {
    if (!popup) return;
    popup.addEventListener('click', (e) => {
      if (e.target === popup || e.target.classList.contains('popup-backdrop')) {
        closePopup(popup);
      }
    });
  });
  if (serviceDetail) {
    serviceDetail.addEventListener('click', (e) => {
      if (e.target === serviceDetail || e.target.classList.contains('service-detail-backdrop')) {
        closeServiceDetailPopup();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeServiceDetailPopup();
      closePopup(popupServices);
      closePopup(popupProjects);
      closePopup(popupCases);
    }
  });

  // ── AGENCY BUTTON LINKS ──
  // Agency URLs
  const agencyLinks = {
    'btn-regular': 'https://agencyb-vert.vercel.app',
    'btn-digital': 'https://marketing-agency-dusky.vercel.app',
    'btn-ethic': 'https://etic-a.vercel.app',
  };

  Object.entries(agencyLinks).forEach(([id, url]) => {
    const btn = document.getElementById(id);
    if (btn && url) {
      btn.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener');
      });
    }
  });

  // ── PROJECT/CASE CARDS CLICKABLE ──
  function initProjectCards() {
    document.querySelectorAll('.project-card').forEach(card => {
      const link = card.querySelector('.project-link');
      if (!link) return;

      card.addEventListener('click', (e) => {
        // Prevent double-firing if clicking directly on the link
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.open(href, link.target || '_blank', 'noopener');
        }
      });
    });
  }

  // ── SERVICE CARD DETAILS ──
  function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', () => openServiceDetail(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openServiceDetail(card);
        }
      });
    });
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    initVideos();
    initProjectCards();
    initServiceCards();
  });

  // Also run init if DOM is already loaded
  if (document.readyState !== 'loading') {
    applyLanguage(currentLang);
    initVideos();
    initProjectCards();
    initServiceCards();
  }

})();
