create table public.cabinet_workspace_states (
  workspace_key text not null,
  state_key text not null,
  state jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (workspace_key, state_key),
  constraint cabinet_workspace_states_workspace_key_format
    check (workspace_key ~ '^[a-z0-9:_-]{1,120}$'),
  constraint cabinet_workspace_states_state_key_format
    check (state_key ~ '^[a-z0-9:_-]{1,120}$'),
  constraint cabinet_workspace_states_state_size
    check (octet_length(state::text) <= 1000000)
);

comment on table public.cabinet_workspace_states is
  'Tenant-isolated JSON state for Client Cabinet workspaces.';

alter table public.cabinet_workspace_states enable row level security;
alter table public.cabinet_workspace_states force row level security;

revoke all on table public.cabinet_workspace_states from anon, authenticated;
grant select, insert, update on table public.cabinet_workspace_states to authenticated;

create or replace function public.set_cabinet_workspace_state_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = (select auth.uid());
  return new;
end;
$$;

revoke all on function public.set_cabinet_workspace_state_audit_fields() from public;

create trigger set_cabinet_workspace_state_audit_fields
before insert or update on public.cabinet_workspace_states
for each row execute function public.set_cabinet_workspace_state_audit_fields();

create policy "Cabinet users read assigned workspace state"
on public.cabinet_workspace_states
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or workspace_key = case
    when coalesce((select auth.jwt() -> 'app_metadata' ->> 'client_id'), 'starter') = 'starter'
      then 'starter:' || (select auth.uid())::text
    else lower((select auth.jwt() -> 'app_metadata' ->> 'client_id'))
  end
);

create policy "Cabinet users create assigned workspace state"
on public.cabinet_workspace_states
for insert
to authenticated
with check (
  (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or workspace_key = case
      when coalesce((select auth.jwt() -> 'app_metadata' ->> 'client_id'), 'starter') = 'starter'
        then 'starter:' || (select auth.uid())::text
      else lower((select auth.jwt() -> 'app_metadata' ->> 'client_id'))
    end
  )
  and (
    updated_by = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);

create policy "Cabinet users update assigned workspace state"
on public.cabinet_workspace_states
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or workspace_key = case
    when coalesce((select auth.jwt() -> 'app_metadata' ->> 'client_id'), 'starter') = 'starter'
      then 'starter:' || (select auth.uid())::text
    else lower((select auth.jwt() -> 'app_metadata' ->> 'client_id'))
  end
)
with check (
  (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or workspace_key = case
      when coalesce((select auth.jwt() -> 'app_metadata' ->> 'client_id'), 'starter') = 'starter'
        then 'starter:' || (select auth.uid())::text
      else lower((select auth.jwt() -> 'app_metadata' ->> 'client_id'))
    end
  )
  and (
    updated_by = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);
