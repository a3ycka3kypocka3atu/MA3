# 34ForFree7 Telegram Bot Deployment

The bot must run as a persistent Node.js process. GitHub stores the code, but it does not run the bot.

## Recommended Setup: Render Background Worker

This repository includes `render.yaml` at the repo root. It defines a Render worker service for the `bot/` folder.

1. Open Render and create a new Blueprint from the GitHub repository.
2. Select the repository `a3ycka3kypocka3atu/34ForFree7`.
3. Render will read `render.yaml` and create `34forfree7-telegram-bot`.
4. Add these environment variables in Render:
   - `BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_CHAT_IDS`

`ADMIN_CHAT_IDS` must contain numeric Telegram chat IDs, separated by commas.

Example:

```env
ADMIN_CHAT_IDS=123456789,987654321
```

Each admin must open the bot and press `/start` once before the bot can send them direct notifications.

## Why Not Just GitHub?

GitHub does not keep a Node.js process running. Pushing code only updates the repository.

For `/start` to react while your PC is off, the bot must be running on a server such as Render, Railway, Fly.io, or a VPS.

## Local Testing

```bash
cd bot
npm start
```

This works only while the terminal stays open.
