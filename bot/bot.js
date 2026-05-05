require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// ── ENV CONFIG ──
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.use(session());

// ── CONSTANTS ──
const MAIN_WEBSITE = 'https://ma-3-rose.vercel.app';
const AGENCIES = [
  {
    name: 'Santiago Way',
    desc: 'Digital Zen Studio & Incubator. A space for community, yoga, and project launches in Prague.',
    url: 'https://santiago-way.vercel.app'
  },
  {
    name: 'DetoxWay',
    desc: 'Health, wellness, and conscious networking. Programs for physical and mental rejuvenation.',
    url: 'https://detox-way.vercel.app'
  },
  {
    name: 'MA3 Agency',
    desc: 'Digital Infrastructure & Automations. We build the systems that power modern ecosystems.',
    url: MAIN_WEBSITE
  }
];

// ── START COMMAND ──
bot.start((ctx) => {
  const welcomeText = `
Welcome to **MA3 Agency Bot**! 🚀

We are a digital infrastructure hub specializing in automations, AI integrations, and community ecosystems.

How can we help you today?
  `;

  ctx.replyWithMarkdown(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Free Business Audit', 'free_audit')],
      [Markup.button.callback('🏢 Our Agencies', 'show_agencies')],
      [Markup.button.callback('💡 Make an Offer', 'make_offer'), Markup.button.callback('❓ Ask a Question', 'ask_question')],
      [Markup.button.url('🌐 Visit Website', MAIN_WEBSITE)]
    ])
  );
});

// ── AUDIT LOGIC ──
bot.action('free_audit', (ctx) => {
  const auditText = `
**Free Business Analysis** 🔍

We will perform a deep-dive check of your business infrastructure and provide a free efficiency analysis. After our review, we will get in touch with a custom offer on how we can optimize your workflows and scale your project.

**To get started, please send us:**
• A link to your website or social media
• A brief description of your current process
• Or a document/brief for us to review

_Please type your information below:_
  `;
  
  ctx.session = { state: 'waiting_audit' };
  ctx.replyWithMarkdown(
    auditText,
    Markup.inlineKeyboard([[Markup.button.callback('⬅️ Cancel', 'main_menu')]])
  );
});

// ── AGENCY MENU ──
bot.action('show_agencies', (ctx) => {
  let agencyText = `**Our Ecosystem** 🌐\n\n`;
  AGENCIES.forEach(a => {
    agencyText += `🔹 **${a.name}**\n${a.desc}\n[Visit Site](${a.url})\n\n`;
  });

  ctx.replyWithMarkdown(
    agencyText,
    Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]
    ])
  );
});

bot.action('main_menu', (ctx) => {
  ctx.answerCbQuery();
  const welcomeText = `
**MA3 Agency Bot** 🚀
Digital Infrastructure Hub.

How can we help you today?
  `;

  ctx.editMessageText(
    welcomeText,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Free Business Audit', 'free_audit')],
        [Markup.button.callback('🏢 Our Agencies', 'show_agencies')],
        [Markup.button.callback('💡 Make an Offer', 'make_offer'), Markup.button.callback('❓ Ask a Question', 'ask_question')],
        [Markup.button.url('🌐 Visit Website', MAIN_WEBSITE)]
      ])
    }
  );
});

// ── OFFER / ASK LOGIC ──
bot.action('make_offer', (ctx) => {
  ctx.session = { state: 'waiting_offer' };
  ctx.reply('We are always open to collaboration! 🤝\n\nPlease describe your offer or project idea below:');
});

bot.action('ask_question', (ctx) => {
  ctx.session = { state: 'waiting_question' };
  ctx.reply('What would you like to know? ❓\n\nPlease type your question below and our team will get back to you:');
});

bot.on('text', async (ctx, next) => {
  if (!ctx.session || !ctx.session.state) return next();

  const userText = ctx.message.text;
  const state = ctx.session.state;
  ctx.session.state = null;

  let type = 'Inquiry';
  if (state === 'waiting_offer') type = 'Offer';
  if (state === 'waiting_question') type = 'Question';
  if (state === 'waiting_audit') type = 'Business Audit Request';
  
  ctx.reply(`Thank you! Your ${type.toLowerCase()} has been received. Our team will review it and get back to you shortly with an analysis or response.`);

  // Send to Admin
  if (ADMIN_CHAT_ID) {
    const adminMsg = `
🔔 **New ${type} received!**
From: ${ctx.from.first_name} (@${ctx.from.username || 'none'})
ID: ${ctx.from.id}

**Content**:
${userText}
    `;
    bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg);
  }

  // Save to Supabase
  try {
    await supabase.from('inquiries').insert([
      { 
        telegram_id: ctx.from.id, 
        username: ctx.from.username, 
        type: type, 
        content: userText,
        created_at: new Date().toISOString()
      }
    ]);
  } catch (err) {
    console.warn('Could not save to Supabase, but admin was notified.');
  }
});

// ── LAUNCH ──
bot.launch().then(() => console.log('Agency Bot is running...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
