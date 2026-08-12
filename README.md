# Client Cabinet Platform

Independent multi-agency client platform with authentication, administrator previews, client-specific workspaces, forms, tasks, materials, and knowledge content.

Agency websites remain separate projects. Each agency can link its login button to this platform without sharing source code or client data with its public website.

Production: <https://client-cabinet.vercel.app>

## Production model

- Supabase Auth assigns `app_metadata.client_id` and `app_metadata.role` from trusted server-side code.
- Client and admin state is stored in `cabinet_workspace_states` when the included migration is deployed.
- Row Level Security isolates named client workspaces and gives every unassigned starter account a user-specific workspace key.
- The browser keeps an explicit local fallback when remote sync is unavailable; the header always shows which storage mode is active.
- Google login is only shown when the provider is enabled. Email magic-link login uses the currently enabled Supabase email provider and does not create uninvited accounts.

## Setup

1. Link the repository to the intended Supabase project.
2. Review the generated Supabase configuration and migration.
3. Apply the migration and run Supabase security advisors.
4. Configure the production Site URL and redirect allow list.
5. Keep service-role credentials in trusted backend environments only.
6. Deploy the static application and verify login, client isolation, admin access, and cross-device state sync.
