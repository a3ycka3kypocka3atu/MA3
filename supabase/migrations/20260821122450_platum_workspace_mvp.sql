-- Platum MVP relational workspace foundation.
--
-- This migration intentionally keeps the legacy cabinet_workspace_states table
-- for rollback compatibility, but the MVP client and operator flows use the
-- normalized workspace records below.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.cabinet_workspace_states
  drop constraint if exists cabinet_workspace_states_updated_by_fkey;

alter table public.cabinet_workspace_states
  add constraint cabinet_workspace_states_updated_by_fkey
  foreign key (updated_by) references auth.users (id) on delete set null;

create index if not exists cabinet_workspace_states_updated_by_idx
  on public.cabinet_workspace_states (updated_by);

-- The normalized tables below replace browser access to the legacy JSON state.
-- Keep the table only as rollback evidence; it is no longer an authenticated API.
drop policy if exists "Cabinet users read assigned workspace state"
  on public.cabinet_workspace_states;
drop policy if exists "Cabinet users create assigned workspace state"
  on public.cabinet_workspace_states;
drop policy if exists "Cabinet users update assigned workspace state"
  on public.cabinet_workspace_states;
revoke all on table public.cabinet_workspace_states from anon, authenticated;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('setup', 'active', 'paused', 'archived')),
  current_phase text not null default 'Getting started',
  current_focus text not null default '',
  progress smallint not null default 0 check (progress between 0 and 100),
  latest_update_title text not null default 'Workspace created',
  latest_update_body text not null default 'Your shared project workspace is ready.',
  latest_update_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  constraint workspaces_name_length check (char_length(name) between 1 and 120)
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'team', 'client')),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.project_context (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  objective text not null default '',
  strategy jsonb,
  milestones jsonb not null default '[]'::jsonb,
  next_milestone text not null default '',
  client_visible boolean not null default true,
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now(),
  constraint project_context_strategy_size
    check (strategy is null or octet_length(strategy::text) <= 250000),
  constraint project_context_milestones_shape check (jsonb_typeof(milestones) = 'array'),
  constraint project_context_milestones_size check (octet_length(milestones::text) <= 250000)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  category text not null default 'Project',
  effort text not null default '',
  assignee_kind text not null default 'team' check (assignee_kind in ('client', 'team')),
  assignee_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'waiting', 'review', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_at date,
  client_response text not null default '' check (char_length(client_response) <= 5000),
  client_visible boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  topic text not null default 'Other' check (char_length(topic) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'waiting_team'
    check (status in ('waiting_team', 'waiting_client', 'resolved')),
  client_visible boolean not null default true,
  responded_at timestamptz,
  resolved_at timestamptz,
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create table public.request_replies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null default auth.uid(),
  body text not null check (char_length(body) between 1 and 5000),
  client_visible boolean not null default true,
  created_at timestamptz not null default now(),
  constraint request_replies_request_workspace_fkey
    foreign key (request_id, workspace_id)
    references public.requests (id, workspace_id) on delete cascade
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  definition jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  client_visible boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forms_definition_size check (octet_length(definition::text) <= 250000),
  unique (id, workspace_id)
);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  submitted_by uuid references auth.users (id) on delete set null default auth.uid(),
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewed')),
  submitted_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint form_submissions_answers_size check (octet_length(answers::text) <= 500000),
  constraint form_submissions_form_workspace_fkey
    foreign key (form_id, workspace_id)
    references public.forms (id, workspace_id) on delete cascade
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  kind text not null default 'link'
    check (kind in ('link', 'document', 'presentation', 'video', 'reference')),
  url text not null check (char_length(url) between 1 and 2000),
  status text not null default 'ready' check (status in ('draft', 'ready', 'archived')),
  client_visible boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  url text not null check (char_length(url) between 1 and 2000),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  client_visible boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  context text not null default '' check (char_length(context) <= 5000),
  decision text not null check (char_length(decision) between 1 and 10000),
  status text not null default 'recorded' check (status in ('proposed', 'recorded', 'superseded')),
  client_visible boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid,
  summary text not null check (char_length(summary) between 1 and 500),
  client_visible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_metadata_size check (octet_length(metadata::text) <= 50000)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id, workspace_id);
create index workspace_members_workspace_role_idx on public.workspace_members (workspace_id, role);
create index workspaces_created_by_idx on public.workspaces (created_by);
create index tasks_workspace_status_idx on public.tasks (workspace_id, status, created_at desc);
create index tasks_assignee_user_id_idx on public.tasks (assignee_user_id);
create index requests_workspace_status_idx on public.requests (workspace_id, status, created_at desc);
create index requests_created_by_idx on public.requests (created_by);
create index request_replies_request_created_idx on public.request_replies (request_id, created_at);
create index request_replies_workspace_id_idx on public.request_replies (workspace_id);
create index request_replies_author_id_idx on public.request_replies (author_id);
create index forms_workspace_status_idx on public.forms (workspace_id, status);
create index form_submissions_workspace_status_idx on public.form_submissions (workspace_id, status, created_at desc);
create index form_submissions_form_id_idx on public.form_submissions (form_id);
create index form_submissions_submitted_by_idx on public.form_submissions (submitted_by);
create index form_submissions_reviewed_by_idx on public.form_submissions (reviewed_by);
create index materials_workspace_visible_idx on public.materials (workspace_id, client_visible, created_at desc);
create index deliverables_workspace_visible_idx on public.deliverables (workspace_id, client_visible, created_at desc);
create index decisions_workspace_visible_idx on public.decisions (workspace_id, client_visible, decided_at desc);
create index activity_workspace_created_idx on public.activity (workspace_id, created_at desc);
create index activity_actor_id_idx on public.activity (actor_id);

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.workspace_members
      where workspace_id = target_workspace_id
        and user_id = (select auth.uid())
    );
$$;

create or replace function private.is_workspace_operator(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.workspace_members
      where workspace_id = target_workspace_id
        and user_id = (select auth.uid())
        and role in ('owner', 'admin', 'team')
    );
$$;

create or replace function private.can_read_workspace_record(
  target_workspace_id uuid,
  record_is_client_visible boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_workspace_operator(target_workspace_id)
    or (record_is_client_visible and private.is_workspace_member(target_workspace_id));
$$;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.is_workspace_operator(uuid) from public, anon;
revoke all on function private.can_read_workspace_record(uuid, boolean) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_operator(uuid) to authenticated;
grant execute on function private.can_read_workspace_record(uuid, boolean) to authenticated;

create or replace function private.set_platum_audit_fields()
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

revoke all on function private.set_platum_audit_fields() from public, anon, authenticated;

create trigger workspaces_set_audit_fields
before update on public.workspaces
for each row execute function private.set_platum_audit_fields();

create trigger project_context_set_audit_fields
before update on public.project_context
for each row execute function private.set_platum_audit_fields();

create trigger tasks_set_audit_fields
before update on public.tasks
for each row execute function private.set_platum_audit_fields();

create trigger requests_set_audit_fields
before update on public.requests
for each row execute function private.set_platum_audit_fields();

create trigger forms_set_audit_fields
before update on public.forms
for each row execute function private.set_platum_audit_fields();

create trigger materials_set_audit_fields
before update on public.materials
for each row execute function private.set_platum_audit_fields();

create trigger deliverables_set_audit_fields
before update on public.deliverables
for each row execute function private.set_platum_audit_fields();

create trigger decisions_set_audit_fields
before update on public.decisions
for each row execute function private.set_platum_audit_fields();

create or replace function private.record_request_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activity (
    workspace_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    client_visible
  ) values (
    new.workspace_id,
    new.created_by,
    'request_created',
    'request',
    new.id,
    'New request: ' || new.title,
    new.client_visible
  );
  return new;
end;
$$;

create or replace function private.record_reply_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activity (
    workspace_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    client_visible
  ) values (
    new.workspace_id,
    new.author_id,
    'request_replied',
    'request',
    new.request_id,
    'A response was added to a project request.',
    new.client_visible
  );
  return new;
end;
$$;

revoke all on function private.record_request_activity() from public, anon, authenticated;
revoke all on function private.record_reply_activity() from public, anon, authenticated;

create trigger requests_record_activity
after insert on public.requests
for each row execute function private.record_request_activity();

create trigger request_replies_record_activity
after insert on public.request_replies
for each row execute function private.record_reply_activity();

create or replace function public.respond_to_request(target_request_id uuid, response_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  new_reply_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(response_body, ''))) not between 1 and 5000 then
    raise exception 'Response must contain between 1 and 5000 characters.' using errcode = '22023';
  end if;

  select workspace_id into target_workspace_id
  from public.requests
  where id = target_request_id;

  if target_workspace_id is null
    or not private.is_workspace_operator(target_workspace_id) then
    raise exception 'Workspace operator access required.' using errcode = '42501';
  end if;

  insert into public.request_replies (request_id, workspace_id, author_id, body, client_visible)
  values (target_request_id, target_workspace_id, (select auth.uid()), trim(response_body), true)
  returning id into new_reply_id;

  update public.requests
  set status = 'waiting_client',
      responded_at = now(),
      updated_by = (select auth.uid())
  where id = target_request_id;

  return new_reply_id;
end;
$$;

create or replace function public.set_client_task_status(target_task_id uuid, target_status text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if target_status not in ('open', 'in_progress', 'completed') then
    raise exception 'Invalid client task status.' using errcode = '22023';
  end if;

  select workspace_id into target_workspace_id
  from public.tasks
  where id = target_task_id
    and assignee_kind = 'client'
    and client_visible = true;

  if target_workspace_id is null
    or not private.is_workspace_member(target_workspace_id) then
    raise exception 'Client task access required.' using errcode = '42501';
  end if;

  update public.tasks
  set status = target_status,
      completed_at = case when target_status = 'completed' then now() else null end,
      updated_by = (select auth.uid())
  where id = target_task_id;

  return target_task_id;
end;
$$;

revoke all on function public.respond_to_request(uuid, text) from public, anon;
revoke all on function public.set_client_task_status(uuid, text) from public, anon;
grant execute on function public.respond_to_request(uuid, text) to authenticated;
grant execute on function public.set_client_task_status(uuid, text) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.project_context enable row level security;
alter table public.tasks enable row level security;
alter table public.requests enable row level security;
alter table public.request_replies enable row level security;
alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;
alter table public.materials enable row level security;
alter table public.deliverables enable row level security;
alter table public.decisions enable row level security;
alter table public.activity enable row level security;

alter table public.workspaces force row level security;
alter table public.workspace_members force row level security;
alter table public.project_context force row level security;
alter table public.tasks force row level security;
alter table public.requests force row level security;
alter table public.request_replies force row level security;
alter table public.forms force row level security;
alter table public.form_submissions force row level security;
alter table public.materials force row level security;
alter table public.deliverables force row level security;
alter table public.decisions force row level security;
alter table public.activity force row level security;

create policy workspaces_select_members
on public.workspaces for select to authenticated
using (private.is_workspace_member(id));

create policy workspaces_update_operators
on public.workspaces for update to authenticated
using (private.is_workspace_operator(id))
with check (private.is_workspace_operator(id));

create policy workspace_members_select
on public.workspace_members for select to authenticated
using (user_id = (select auth.uid()) or private.is_workspace_operator(workspace_id));

create policy workspace_members_insert
on public.workspace_members for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy workspace_members_update_operators
on public.workspace_members for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy workspace_members_delete_operators
on public.workspace_members for delete to authenticated
using (private.is_workspace_operator(workspace_id));

create policy project_context_select
on public.project_context for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy project_context_insert_operators
on public.project_context for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy project_context_update_operators
on public.project_context for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy tasks_select
on public.tasks for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy tasks_insert_operators
on public.tasks for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy tasks_update_operators
on public.tasks for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy requests_select
on public.requests for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy requests_insert_members
on public.requests for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.is_workspace_member(workspace_id)
  and (client_visible or private.is_workspace_operator(workspace_id))
);

create policy requests_update_operators
on public.requests for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy request_replies_select
on public.request_replies for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy forms_select
on public.forms for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy forms_insert_operators
on public.forms for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy forms_update_operators
on public.forms for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy form_submissions_select
on public.form_submissions for select to authenticated
using (private.is_workspace_operator(workspace_id) or submitted_by = (select auth.uid()));

create policy form_submissions_insert_members
on public.form_submissions for insert to authenticated
with check (submitted_by = (select auth.uid()) and private.is_workspace_member(workspace_id));

create policy form_submissions_update_operators
on public.form_submissions for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy materials_select
on public.materials for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy materials_insert_operators
on public.materials for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy materials_update_operators
on public.materials for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy deliverables_select
on public.deliverables for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy deliverables_insert_operators
on public.deliverables for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy deliverables_update_operators
on public.deliverables for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy decisions_select
on public.decisions for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

create policy decisions_insert_operators
on public.decisions for insert to authenticated
with check (private.is_workspace_operator(workspace_id));

create policy decisions_update_operators
on public.decisions for update to authenticated
using (private.is_workspace_operator(workspace_id))
with check (private.is_workspace_operator(workspace_id));

create policy activity_select
on public.activity for select to authenticated
using (private.can_read_workspace_record(workspace_id, client_visible));

revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.workspace_members from anon, authenticated;
revoke all on table public.project_context from anon, authenticated;
revoke all on table public.tasks from anon, authenticated;
revoke all on table public.requests from anon, authenticated;
revoke all on table public.request_replies from anon, authenticated;
revoke all on table public.forms from anon, authenticated;
revoke all on table public.form_submissions from anon, authenticated;
revoke all on table public.materials from anon, authenticated;
revoke all on table public.deliverables from anon, authenticated;
revoke all on table public.decisions from anon, authenticated;
revoke all on table public.activity from anon, authenticated;

grant select, update on table public.workspaces to authenticated;
grant select, insert, update, delete on table public.workspace_members to authenticated;
grant select, insert, update on table public.project_context to authenticated;
grant select, insert, update on table public.tasks to authenticated;
grant select, insert, update on table public.requests to authenticated;
grant select on table public.request_replies to authenticated;
grant select, insert, update on table public.forms to authenticated;
grant select, insert, update on table public.form_submissions to authenticated;
grant select, insert, update on table public.materials to authenticated;
grant select, insert, update on table public.deliverables to authenticated;
grant select, insert, update on table public.decisions to authenticated;
grant select on table public.activity to authenticated;

revoke all on sequence public.activity_id_seq from anon, authenticated;

comment on table public.workspaces is 'One private Platum client-service relationship.';
comment on table public.workspace_members is 'Authenticated user membership and role within a workspace.';
comment on table public.requests is 'Two-sided structured questions and requests shared by client and operator.';
comment on table public.request_replies is 'Persisted replies attached to a workspace request.';
comment on table public.activity is 'Append-only project memory generated by trusted database actions.';
comment on function public.respond_to_request(uuid, text) is
  'Operator-only atomic response that records a reply and returns the request to the client.';
comment on function public.set_client_task_status(uuid, text) is
  'Member-only status transition for a visible client-assigned task.';
