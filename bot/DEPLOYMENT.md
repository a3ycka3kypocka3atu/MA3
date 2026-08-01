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
   - `CABINET_TELEGRAM_IDS`
   - `CABINET_URL` (optional; defaults to the production cabinet URL)

`ADMIN_CHAT_IDS` must contain numeric Telegram chat IDs, separated by commas.

Example:

```env
ADMIN_CHAT_IDS=123456789,987654321
```

Each admin must open the bot and press `/start` once before the bot can send them direct notifications.

`CABINET_TELEGRAM_IDS` is the allow-list for Telegram cabinet login. Add each client's numeric Telegram ID, separated by commas. The bot creates a short-lived, one-use Supabase login link only for these IDs and admins.

In Supabase Auth URL Configuration, add `https://34forfree7-rose.vercel.app/client-space.html` to the redirect allow list. To activate Google login, enable the Google provider in Supabase Auth and add its Google OAuth client ID and secret. In Google Auth Platform, use `https://mnqrblzdpdttdynlpqey.supabase.co/auth/v1/callback` as the authorized redirect URI.

Copy an active `sb_publishable_...` key from Supabase Project Settings > API Keys into `client-space.config.js`. This key is designed for browser use. Never copy `SUPABASE_SERVICE_ROLE_KEY` into a frontend file.

## Why Not Just GitHub?

GitHub does not keep a Node.js process running. Pushing code only updates the repository.

For `/start` to react while your PC is off, the bot must be running on a server such as Render, Railway, Fly.io, or a VPS.

## Local Testing

```bash
cd bot
npm start
```

This works only while the terminal stays open.
