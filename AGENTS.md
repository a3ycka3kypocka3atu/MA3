# Platum project context

This project's current canonical name is **Platum**. Previous working names include **Cabinet** and **Client Cabinet**.

The project is undergoing rebranding and reconstruction, so legacy names may remain in code, documentation, infrastructure, URLs, storage keys, and repository history. Do not rename technical identifiers or change infrastructure solely for branding consistency unless the user explicitly requests it.

Canonical project context is available in `../Projects/Platum`. Codex may also consult documentation for related projects under `../Projects` when ecosystem context would materially improve the work.

Current user instructions and the actual repository state remain authoritative for the immediate task. Vision documents provide context; they do not authorize unrelated implementation.

## Project boundary

This repository contains the independent Client Cabinet platform.

- Keep the platform agency-neutral and reusable by multiple agencies.
- Do not add public agency landing pages, agency marketing assets, or agency website source code here.
- Agency websites connect to this platform only through external links, authentication, APIs, or documented integrations.
- Keep client workspaces and client data isolated by authenticated identity and authorization rules.
- Do not commit private client source folders or temporary working files unless the user explicitly requests it.
- The production platform URL is `https://client-cabinet.vercel.app`.
