require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const {
  createTelegramAccessControl,
  normalizeTelegramUserId
} = require('./access-control');

// ── ENV CONFIG ──
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let ADMIN_CHAT_IDS;
let telegramAccess;

try {
  ADMIN_CHAT_IDS = parseNotificationChatIds(process.env.ADMIN_CHAT_IDS);
  telegramAccess = createTelegramAccessControl({
    adminUserIds: process.env.ADMIN_TELEGRAM_USER_IDS,
    workspaceAssignments: process.env.TELEGRAM_WORKSPACE_ASSIGNMENTS
  });
} catch (error) {
  console.error('Invalid Telegram access configuration.', error.message);
  process.exit(1);
}

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.use(session());
bot.use((ctx, next) => {
  registerAdminIfNeeded(ctx);
  return next();
});

// ── CONSTANTS ──
const MAIN_WEBSITE = 'https://34-for-free7.vercel.app';
const CABINET_URL = process.env.CABINET_URL || 'https://client-cabinet.vercel.app';
const OFFER_BRIEF_PATH = path.join(__dirname, '34ForFree7_offer_brief.md');
const ADMIN_STORE_PATH = path.join(__dirname, 'admin_chats.json');
const MAX_INQUIRY_LENGTH = 3000;
const ADMIN_CONTACTS = [
  {
    label: 'Admin 1: @andrisav',
    url: 'https://t.me/andrisav'
  },
  {
    label: 'Admin 2: @Hirchak',
    url: 'https://t.me/Hirchak'
  }
];

const CLIENT_WORKSPACES = [
  // Future client links go here, for example:
  // { label: 'Client Name', url: 'https://notion.so/...' },
  // { label: 'Client Folder', url: 'https://drive.google.com/...' },
];

const SERVICES = [
  {
    key: 'strategy',
    name: 'Marketing Strategy and Client DNA',
    price: '100€–300€',
    market: '500€–1500€',
    desc: 'Market research, competitor analysis, client portrait, offer logic, positioning, and funnel economics.'
  },
  {
    key: 'sites',
    name: 'Sites and Landings',
    price: '150€–500€',
    market: '800€–2500€',
    desc: 'Fast modern websites and landing pages: structure, copy, design, frontend, lead capture, and basic SEO preparation.'
  },
  {
    key: 'mvp',
    name: 'MVP and Product Development',
    price: '1500€–4000€',
    market: '5000€–12000€',
    desc: 'Product interfaces, personal cabinets, questionnaires, Supabase-backed data flows, sharing logic, and core MVP functionality.'
  },
  {
    key: 'bots',
    name: 'Telegram Onboarding and Bots',
    price: '150€–500€',
    market: '500€–2000€',
    desc: 'Telegram bot flows, forms, user profiles, quick access, onboarding, lead generation, and internal routing.'
  },
  {
    key: 'analytics',
    name: 'Funnel and Analytics',
    price: '100€–1000€',
    market: '1500€–4000€',
    desc: 'Client journey audit, CTA logic, tracking checklist, conversion gaps, and clear optimization priorities.'
  },
  {
    key: 'integrations',
    name: 'Integrations and Databases',
    price: '200€–700€',
    market: '700€–3000€',
    desc: 'Databases, profiles, matching logic, structured data flows, simple admin logic, and clean tool-to-tool integration.'
  },
  {
    key: 'automations',
    name: 'Automations',
    price: '300€–1000€',
    market: '1000€–5000€',
    desc: 'n8n workflows, CRM synchronization, internal notifications, reporting flows, and repeated-process automation.'
  },
  {
    key: 'video',
    name: 'Video Automation',
    price: '300€–1000€',
    market: '2000€–10000€',
    desc: 'Remotion and code-driven video systems for personalized creatives, repeated content formats, and scalable production.'
  }
];

function mainMenuKeyboard(ctx) {
  const rows = [
    [Markup.button.callback('🔐 Client cabinet', 'cabinet_login')],
    [Markup.button.callback('🧩 Choose a Service', 'services_menu')],
    [Markup.button.callback('🔍 Free Product & Market Analysis', 'free_audit')],
    [Markup.button.callback('📄 Get Offer Brief', 'offer_brief')],
    [Markup.button.callback('✍️ Ask / Send Project', 'ask_question')],
    [Markup.button.callback('👤 Contact the Team', 'contact_team')],
    [Markup.button.url('🌐 Visit Website', MAIN_WEBSITE)]
  ];

  if (ctx.chat?.type === 'private' && isAdmin(ctx)) {
    rows.unshift([Markup.button.callback('🏢 34ForFree7 Office', '34forfree7_office')]);
  }

  return Markup.inlineKeyboard(rows);
}

async function sendCabinetLogin(ctx) {
  if (ctx.chat?.type !== 'private') {
    return ctx.reply('For security, open the bot in a private chat to access the client cabinet.');
  }

  const access = telegramAccess.resolveAccess(ctx.from?.id);
  if (!access) {
    return ctx.reply(
      'No Platum workspace is assigned to this Telegram user ID. Contact the team to request access.'
    );
  }

  const fullName = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Client';
  const clientId = access.workspaceKey;
  const role = access.role;
  const email = `telegram-${access.telegramUserId}@clients.34forfree7.com`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: CABINET_URL,
      data: {
        auth_source: 'telegram',
        telegram_id: access.telegramUserId,
        username: ctx.from?.username || '',
        full_name: fullName
      }
    }
  });

  if (error || !data?.properties?.action_link || !data?.user?.id) {
    console.error('Could not generate cabinet login link.', error?.message || error);
    return ctx.reply('The secure login link could not be created. Please try again in a moment.');
  }

  const { error: metadataError } = await supabase.auth.admin.updateUserById(data.user.id, {
    app_metadata: {
      ...(data.user.app_metadata || {}),
      client_id: clientId,
      role,
      auth_source: 'telegram',
      telegram_id: access.telegramUserId,
      telegram_username: ctx.from?.username || ''
    }
  });

  if (metadataError) {
    console.error('Could not assign cabinet access.', metadataError.message || metadataError);
    return ctx.reply('The cabinet could not be assigned securely. Please try again in a moment.');
  }

  const cabinetMessage = clientId === 'admin'
    ? 'Your admin cabinet is ready. Choose any existing client cabinet or preview the clean new-client template.'
    : 'Your assigned client workspace link is ready. It can be used once and expires shortly.';

  return ctx.reply(
    cabinetMessage,
    Markup.inlineKeyboard([
      [Markup.button.url('Open client cabinet →', data.properties.action_link)],
      [Markup.button.callback('⬅️ Main menu', 'main_menu')]
    ])
  );
}

function serviceKeyboard() {
  const serviceRows = SERVICES.map(service => [
    Markup.button.callback(service.name, `service_${service.key}`)
  ]);
  return Markup.inlineKeyboard([
    ...serviceRows,
    [Markup.button.callback('🔍 Request free analysis', 'free_audit')],
    [Markup.button.callback('⬅️ Main menu', 'main_menu')]
  ]);
}

function contactKeyboard() {
  return Markup.inlineKeyboard([
    ADMIN_CONTACTS.map(contact => Markup.button.url(contact.label, contact.url)),
    [Markup.button.callback('📨 Ask 34ForFree7 to contact me', 'contact_request')],
    [Markup.button.callback('⬅️ Main menu', 'main_menu')]
  ]);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseNotificationChatIds(value = '') {
  if (value === undefined || value === null || String(value).trim() === '') return [];
  if (typeof value !== 'string') {
    throw new TypeError('ADMIN_CHAT_IDS must be a comma-separated string.');
  }

  const chatIds = value.split(',').map(id => id.trim());
  if (chatIds.some(id => !/^-?[1-9]\d*$/.test(id))) {
    throw new Error('ADMIN_CHAT_IDS must contain only numeric Telegram chat IDs.');
  }

  return [...new Set(chatIds)];
}

function getUserLabel(ctx) {
  const name = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Telegram user';
  const username = ctx.from?.username ? `@${ctx.from.username}` : 'no username';
  return `${name} (${username}, ID: ${ctx.from?.id})`;
}

function readRegisteredAdminChatIds() {
  try {
    if (!fs.existsSync(ADMIN_STORE_PATH)) return [];
    const data = JSON.parse(fs.readFileSync(ADMIN_STORE_PATH, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];

    return Object.entries(data).flatMap(([userId, chatId]) => {
      const normalizedUserId = normalizeTelegramUserId(userId);
      const normalizedChatId = normalizeTelegramUserId(chatId);

      if (
        !normalizedUserId ||
        normalizedChatId !== normalizedUserId ||
        !telegramAccess.isAdmin(normalizedUserId)
      ) {
        return [];
      }

      return [normalizedChatId];
    });
  } catch (err) {
    console.warn('Could not read registered admin chat IDs.');
    return [];
  }
}

function registerAdminIfNeeded(ctx) {
  const userId = normalizeTelegramUserId(ctx.from?.id);
  const chatId = normalizeTelegramUserId(ctx.chat?.id);

  if (
    !userId ||
    !telegramAccess.isAdmin(userId) ||
    ctx.chat?.type !== 'private' ||
    chatId !== userId
  ) {
    return;
  }

  try {
    const data = fs.existsSync(ADMIN_STORE_PATH)
      ? JSON.parse(fs.readFileSync(ADMIN_STORE_PATH, 'utf8'))
      : {};
    const registeredAdmins = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    registeredAdmins[userId] = chatId;
    fs.writeFileSync(ADMIN_STORE_PATH, JSON.stringify(registeredAdmins, null, 2));
  } catch (err) {
    console.warn('Could not register admin chat ID.');
  }
}

function getAdminChatIds() {
  return [...new Set([...ADMIN_CHAT_IDS, ...readRegisteredAdminChatIds()])];
}

function isAdmin(ctx) {
  return telegramAccess.isAdmin(ctx.from?.id);
}

function safeAnswer(ctx) {
  return ctx.answerCbQuery().catch(() => {});
}

async function notifyAdmins(ctx, type, content) {
  const adminChatIds = getAdminChatIds();

  if (!adminChatIds.length) {
    console.warn('No ADMIN_CHAT_IDS configured. Inquiry was not forwarded to admins.');
    return false;
  }

  const message = `
<b>New 34ForFree7 ${escapeHtml(type)}</b>

<b>From:</b> ${escapeHtml(getUserLabel(ctx))}

<b>Message:</b>
${escapeHtml(content)}
  `.trim();

  const results = await Promise.allSettled(
    adminChatIds.map(chatId =>
      bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' })
    )
  );
  return results.some(result => result.status === 'fulfilled');
}

async function saveInquiry(ctx, type, content) {
  try {
    const { error } = await supabase.from('inquiries').insert([
      {
        telegram_id: ctx.from.id,
        username: ctx.from.username,
        type,
        content,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.warn('Could not save inquiry to Supabase.', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Could not save inquiry to Supabase.', err);
    return false;
  }
}

// ── START COMMAND ──
bot.start(async (ctx) => {
  if (ctx.startPayload === 'cabinet') {
    return sendCabinetLogin(ctx);
  }

  const welcomeText = `
<b>Welcome to 34ForFree7.</b>

We are an AI-native web, growth and product studio.

We help founders, small businesses and conscious projects build:
• strategy and client DNA
• websites and landing pages
• MVPs and product systems
• Telegram bots and onboarding
• funnels, analytics and automations

You can choose a service, ask a question, send your project directly, or request a short free product and market analysis.
  `.trim();

  ctx.reply(
    welcomeText,
    { parse_mode: 'HTML', ...mainMenuKeyboard(ctx) }
  );
});

bot.action('cabinet_login', async (ctx) => {
  await safeAnswer(ctx);
  return sendCabinetLogin(ctx);
});

bot.command('myid', (ctx) => {
  const userId = normalizeTelegramUserId(ctx.from?.id) || 'unavailable';
  const chatId = ctx.chat?.id === undefined ? 'unavailable' : String(ctx.chat.id);
  ctx.reply(
    `Your Telegram numeric user ID is:\n\n${userId}\n\nYour current chat ID is:\n\n${chatId}\n\nAccess is assigned only by user ID. Chat IDs are used only for notifications.`
  );
});

bot.action('services_menu', (ctx) => {
  safeAnswer(ctx);
  ctx.reply(
    `<b>Choose the service you are interested in.</b>\n\nYou can also describe your project in your own words. We will help define what you need.`,
    { parse_mode: 'HTML', ...serviceKeyboard() }
  );
});

SERVICES.forEach(service => {
  bot.action(`service_${service.key}`, (ctx) => {
    safeAnswer(ctx);
    ctx.session = {
      state: 'waiting_service_request',
      selectedService: service.name
    };

    const serviceText = `
<b>${escapeHtml(service.name)}</b>

${escapeHtml(service.desc)}

<b>Our early client price:</b> ${escapeHtml(service.price)}
<s>Regular market price: ${escapeHtml(service.market)}</s>

If this service fits your project, send us a short message:
• what you want to build or improve
• link to your product / website / social media, if you have one
• your timeline and budget range, if already clear
    `.trim();

    ctx.reply(serviceText, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Get free short analysis first', 'free_audit')],
        [Markup.button.callback('👤 Contact the team', 'contact_team')],
        [Markup.button.callback('⬅️ Services', 'services_menu')]
      ])
    });
  });
});

// ── AUDIT LOGIC ──
bot.action('free_audit', (ctx) => {
  const auditText = `
<b>Free short product & market analysis</b>

We can prepare a short, precise first look at your product, market position and growth opportunities, so you can see how 34ForFree7 thinks before committing to paid work.

Please send:
• your website, product, social media or idea
• what you sell / plan to launch
• who your client is
• what feels unclear right now: strategy, funnel, website, MVP, automation, bot, analytics

We will review it and contact you with a compact, practical analysis.
  `.trim();
  
  ctx.session = { state: 'waiting_audit' };
  ctx.reply(
    auditText,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Main menu', 'main_menu')]]) }
  );
});

bot.action('offer_brief', async (ctx) => {
  await safeAnswer(ctx);
  await ctx.reply(
    `<b>34ForFree7 offer brief</b>\n\nThis file gives you a compact overview of what we build, our startup-friendly pricing logic and what to send us for a fast proposal.`,
    { parse_mode: 'HTML' }
  );
  await ctx.replyWithDocument({
    source: OFFER_BRIEF_PATH,
    filename: '34ForFree7_offer_brief.md'
  });
});

bot.action('34forfree7_office', (ctx) => {
  safeAnswer(ctx);

  if (!isAdmin(ctx)) {
    return ctx.reply('This office area is available only for 34ForFree7 admins.');
  }
  if (ctx.chat?.type !== 'private') {
    return ctx.reply('For security, open the bot in a private chat to access the office area.');
  }

  const workspaceRows = CLIENT_WORKSPACES.map(client => [
    Markup.button.url(client.label, client.url)
  ]);

  const keyboardRows = workspaceRows.length
    ? workspaceRows
    : [[Markup.button.callback('No client folders yet', '34forfree7_office_empty')]];

  ctx.reply(
    `<b>34ForFree7 Office</b>\n\nPrivate admin space for client work links.\n\nSoon this panel will contain buttons to each client folder: Notion, Google Drive, Docs, briefs, contracts, project notes and delivery materials.\n\nCurrent status: no client folders connected yet.`,
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        ...keyboardRows,
        [Markup.button.callback('⬅️ Main menu', 'main_menu')]
      ])
    }
  );
});

bot.action('34forfree7_office_empty', (ctx) => {
  safeAnswer(ctx);

  if (!isAdmin(ctx)) {
    return ctx.reply('This office area is available only for 34ForFree7 admins.');
  }
  if (ctx.chat?.type !== 'private') {
    return ctx.reply('For security, open the bot in a private chat to access the office area.');
  }

  ctx.reply('No client folders are connected yet. When we create the first client workspace, we will add it here as a button.');
});

bot.action('main_menu', (ctx) => {
  safeAnswer(ctx);
  const welcomeText = `
<b>34ForFree7 Agency Bot</b>

Choose a service, request a free short analysis, send a project message, or contact the team directly.
  `.trim();

  ctx.editMessageText(
    welcomeText,
    {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(ctx)
    }
  ).catch(() => ctx.reply(welcomeText, { parse_mode: 'HTML', ...mainMenuKeyboard(ctx) }));
});

// ── OFFER / ASK LOGIC ──
bot.action('make_offer', (ctx) => {
  ctx.session = { state: 'waiting_offer' };
  ctx.reply('We are always open to collaboration! 🤝\n\nPlease describe your offer or project idea below:');
});

bot.action('ask_question', (ctx) => {
  safeAnswer(ctx);
  ctx.session = { state: 'waiting_question' };
  ctx.reply(
    'Write your question or project message here. You can send it freely: idea, link, current problem, or what you want 34ForFree7 to build.',
    Markup.inlineKeyboard([[Markup.button.callback('⬅️ Main menu', 'main_menu')]])
  );
});

bot.action('contact_team', (ctx) => {
  safeAnswer(ctx);
  ctx.reply(
    `<b>Contact 34ForFree7 team</b>\n\nYou can message us directly, or ask the bot to forward your request to the team.`,
    { parse_mode: 'HTML', ...contactKeyboard() }
  );
});

bot.action('contact_request', (ctx) => {
  safeAnswer(ctx);
  ctx.session = { state: 'waiting_contact_request' };
  ctx.reply(
    'Please write a short message for the team: what you need, your project link if you have one, and the best way to contact you.'
  );
});

bot.on('text', async (ctx, next) => {
  if (!ctx.session || !ctx.session.state) return next();

  const userText = String(ctx.message.text || '').trim();
  if (!userText) {
    return ctx.reply('Please send a non-empty message.');
  }
  if (userText.length > MAX_INQUIRY_LENGTH) {
    return ctx.reply(
      `Please shorten your message to ${MAX_INQUIRY_LENGTH} characters or fewer and send it again.`
    );
  }

  const state = ctx.session.state;
  const selectedService = ctx.session.selectedService;
  ctx.session.state = null;
  ctx.session.selectedService = null;

  let type = 'Inquiry';
  if (state === 'waiting_offer') type = 'Offer';
  if (state === 'waiting_question') type = 'Question';
  if (state === 'waiting_audit') type = 'Free Product & Market Analysis Request';
  if (state === 'waiting_service_request') type = `Service Request: ${selectedService}`;
  if (state === 'waiting_contact_request') type = 'Direct Contact Request';
  
  const saved = await saveInquiry(ctx, type, userText);
  const sentToAdmins = await notifyAdmins(ctx, type, userText);

  let confirmation;
  if (sentToAdmins) {
    confirmation = `Thank you. Your message was sent to the 34ForFree7 team.\n\nWe will review it and contact you with the next step, a short analysis, or a practical offer.`;
  } else if (saved) {
    confirmation = `Thank you. Your message was saved, but admin forwarding is not configured yet.\n\nPlease contact the team directly for now.`;
  } else {
    confirmation = `We could not deliver your message right now. Please contact the team directly.`;
  }

  await ctx.reply(
    confirmation,
    Markup.inlineKeyboard([
      [Markup.button.callback('👤 Contact directly', 'contact_team')],
      [Markup.button.callback('⬅️ Main menu', 'main_menu')]
    ])
  );
});

// ── LAUNCH ──
bot.launch().then(() => console.log('Agency Bot is running...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
