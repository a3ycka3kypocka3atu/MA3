# 34ForFree7 Telegram Bot Deployment

The bot must run as a persistent Node.js process. GitHub stores the code, but it does not run the bot.

## Recommended Setup: Render Background Worker

This repository includes `render.yaml` at the repo root. It defines a Render worker service for the `bot/` folder.

1. Open Render and create a new Blueprint from the GitHub repository.
2. Select the repository `a3ycka3kypocka3atu/Cabinet`.
3. Render will read `render.yaml` and create `34forfree7-telegram-bot`.
4. Add these environment variables in Render:
   - `BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_TELEGRAM_USER_IDS`
   - `TELEGRAM_WORKSPACE_ASSIGNMENTS`
   - `ADMIN_CHAT_IDS`
   - `CABINET_URL` (optional; defaults to the production cabinet URL)

Access is fail-closed and uses immutable numeric Telegram user IDs only. There are no default admins or default client assignments. Do not use Telegram usernames for either admin authorization or workspace assignment.

`ADMIN_TELEGRAM_USER_IDS` is the comma-separated allowlist of users who receive Platum admin access:

```env
ADMIN_TELEGRAM_USER_IDS=123456789,987654321
```

`TELEGRAM_WORKSPACE_ASSIGNMENTS` maps each authorized client user ID to one workspace key. Entries use `numericUserId:workspaceKey`, separated by commas:

```env
TELEGRAM_WORKSPACE_ASSIGNMENTS=555555555:client_alpha,666666666:client_beta
```

An admin allowlisted in `ADMIN_TELEGRAM_USER_IDS` does not need a workspace assignment. Any non-admin user without an explicit workspace assignment is denied cabinet access; the bot does not create starter access automatically.

`ADMIN_CHAT_IDS` contains numeric Telegram chat IDs used only as inquiry-notification destinations. It does not grant admin or cabinet access:

Example:

```env
ADMIN_CHAT_IDS=123456789,987654321
```

An allowlisted admin can open the bot in a private chat and press `/start` to auto-register that private chat as a notification destination. Auto-registration occurs only when the sender's numeric user ID is present in `ADMIN_TELEGRAM_USER_IDS`. Alternatively, configure notification destinations explicitly in `ADMIN_CHAT_IDS`.

The bot stores the resolved role and workspace assignment in protected Supabase `app_metadata`. A Telegram username may be stored as informational profile data, but it is never used to authorize access.

In Supabase Auth URL Configuration, add `https://client-cabinet.vercel.app` and `https://client-cabinet.vercel.app/client-space.html` to the redirect allow list. To activate Google login, enable the Google provider in the Supabase project assigned to Platum and add its Google OAuth client ID and secret. In Google Auth Platform, use `https://<PLATUM_PROJECT_REF>.supabase.co/auth/v1/callback` as the authorized redirect URI after confirming that project reference in the Platum-owned account.

Copy an active `sb_publishable_...` key from Supabase Project Settings > API Keys into `client-space.config.js`. This key is designed for browser use. Never copy `SUPABASE_SERVICE_ROLE_KEY` into a frontend file.

## Why Not Just GitHub?

GitHub does not keep a Node.js process running. Pushing code only updates the repository.

For `/start` to react while your PC is off, the bot must be running on a server such as Render, Railway, Fly.io, or a VPS.

## Local Testing

```bash
cd bot
npm test
npm start
```

To run syntax checks without starting the worker:

```bash
cd bot
node --check bot.js
node --check access-control.js
node --check access-control.test.js
```

`npm start` works only while the terminal stays open.
