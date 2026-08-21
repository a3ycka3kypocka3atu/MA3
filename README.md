# Platum

Platum, previously developed as Cabinet and Client Cabinet, is an independent, agency-neutral client-service workspace. One authenticated workspace connects a client and the assigned project team around the same project context, tasks, requests, responses, materials, and activity history.

Agency websites remain separate projects. They can link to Platum but must not share source code, authentication state, or client data with this repository.

Production target: <https://client-cabinet.vercel.app>

The frontend and normalized database implementation are prepared locally. Production is not configured or verified until the Supabase project assigned to Platum is available, the migrations and RLS tests pass there, real memberships are provisioned, and the application is deployed and browser-tested with real users.

## MVP journey

The completed local vertical slice is:

1. An invited client signs in and is authorized through `workspace_members`.
2. The client creates a structured project request.
3. An owner, administrator, or assigned team member sees that request in Agency OS.
4. The operator publishes a persisted reply.
5. The request, reply, and activity remain visible to the client after reload or a later authenticated session.

The client and Agency OS interfaces use the same relational records. The previous coarse JSON table remains only as rollback evidence and is no longer granted to authenticated browser users by the new migration.

## Application boundary

- `client-space.html` contains the English-only client workspace and the internal Agency OS interface.
- `cabinet-data.js` is the authenticated PostgREST/RPC adapter for memberships, workspaces, tasks, requests, replies, forms, materials, deliverables, and activity.
- `supabase/migrations/` contains the reproducible legacy migration and normalized Platum workspace migration.
- `supabase/tests/` contains the authenticated RLS allow/deny and cross-workspace isolation tests.
- `prohor-intake.html` is a legacy-named, English-only questionnaire whose answers stay on the current device. It is not the MVP write path.
- `bot/` contains the optional Telegram access worker. Authorization uses explicit immutable numeric user IDs and workspace assignments.
- `google-sheets-intake-webapp.gs` is a disabled-by-default reference collector. The browser does not call it.

Public JavaScript contains no private client records. Remote application data is fetched only after authentication and membership authorization. The local preview remains available for interface review and is clearly separated from remote sync.

## Local verification

Run the repository and bot checks:

```sh
node scripts/check-integrity.js
npm --prefix bot test
```

Run the deterministic local shared-journey service:

```sh
node scripts/mock-platum-api.js
```

Then open these test identities on `http://127.0.0.1:4177/client-space.html`:

- `?test-user=client-a#questions` — assigned client in workspace A.
- `?test-user=operator-a` — assigned administrator in workspace A.
- `?test-user=client-b#questions` — client in isolated workspace B.
- `?test-user=outsider` — authenticated user with no membership; access must be denied.

The `test-user` path is accepted only on localhost and only when the local test configuration supplies it. It is absent from production configuration.

For full local database verification, Docker and the Supabase CLI are required:

```sh
npx supabase@latest start
npx supabase@latest db reset
npx supabase@latest test db
```

## Platum Supabase activation

Use only the Supabase project assigned to Platum. Do not reuse another ecosystem project's database, key, users, or service credentials.

1. Sign in to the Platum-owned Supabase account and link this repository to that project.
2. Confirm the project reference before applying anything.
3. Run a clean local reset and the pgTAP isolation suite.
4. Review the migration diff, then apply the migrations to the Platum project.
5. Keep public signup disabled. Invite real test users through a trusted administrative path.
6. Provision one workspace plus explicit owner/admin/team/client memberships. Do not authorize users from browser-controlled metadata or Telegram usernames.
7. Run the RLS tests and Supabase security/performance advisors.
8. Put only the Platum API URL and publishable key in `client-space.config.js`. Never place a secret or service-role key in the browser.
9. Configure the production Site URL and exact redirect allow list.
10. Browser-test the full journey with two client identities and one operator, including reload/new-session persistence and direct cross-workspace denial.

## Release checks

Before production release:

- verify real email and any enabled OAuth login;
- verify anonymous, uninvited, client, team, administrator, and cross-client RLS behavior;
- verify a client request, operator reply, client reload, and corresponding database activity records;
- deploy the exact reviewed revision to Vercel and verify the production URL;
- configure Render and Telegram only if they are part of the release journey;
- complete the separately authorized containment work for data previously exposed in repository history and the legacy Apps Script deployment.

No Git-history rewrite, credential rotation, endpoint shutdown, database migration, or deployment is performed by the local setup commands above.

## Protected local material

Private source and temporary folders are ignored and must not be committed. Preserve any required client source in an approved private backup before separately authorized repository sanitation.
