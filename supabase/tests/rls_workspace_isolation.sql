begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'operator-a@platum.test', now(), '{}', '{}', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client-a@platum.test', now(), '{}', '{}', now(), now()),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client-b@platum.test', now(), '{}', '{}', now(), now()),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'uninvited@platum.test', now(), '{}', '{}', now(), now());

insert into public.workspaces (
  id,
  slug,
  name,
  created_by,
  updated_by
) values
  ('11111111-1111-4111-8111-111111111111', 'workspace-a', 'Workspace A', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('22222222-2222-4222-8222-222222222222', 'workspace-b', 'Workspace B', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');

insert into public.workspace_members (workspace_id, user_id, role, created_by) values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'client', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('22222222-2222-4222-8222-222222222222', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'client', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');

insert into public.requests (id, workspace_id, created_by, topic, title, message) values
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Strategy', 'Question from client A', 'Please confirm the next step.'),
  ('44444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Strategy', 'Question from client B', 'This must remain isolated.');

insert into public.tasks (id, workspace_id, title, assignee_kind, client_visible, created_by, updated_by) values
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Client A task', 'client', true, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('66666666-6666-4666-8666-666666666666', '22222222-2222-4222-8222-222222222222', 'Client B task', 'client', true, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.workspaces),
  1::bigint,
  'client A sees only workspace A'
);

select is(
  (select count(*) from public.requests),
  1::bigint,
  'client A sees only requests from workspace A'
);

select lives_ok(
  $$insert into public.requests (workspace_id, topic, title, message)
    values ('11111111-1111-4111-8111-111111111111', 'Task', 'Client A action', 'This should reach the operator.')$$,
  'client A can create a request in workspace A'
);

select throws_ok(
  $$insert into public.requests (workspace_id, topic, title, message)
    values ('22222222-2222-4222-8222-222222222222', 'Task', 'Cross-workspace attempt', 'This must be denied.')$$,
  '42501',
  'new row violates row-level security policy for table "requests"',
  'client A cannot create a request in workspace B'
);

select is_empty(
  $$update public.requests
    set status = 'resolved'
    where id = '33333333-3333-4333-8333-333333333333'
    returning id$$,
  'client A cannot apply operator-only request updates'
);

select lives_ok(
  $$select public.set_client_task_status('55555555-5555-4555-8555-555555555555', 'completed')$$,
  'client A can complete a visible task in workspace A'
);

select throws_ok(
  $$select public.set_client_task_status('66666666-6666-4666-8666-666666666666', 'completed')$$,
  '42501',
  'Client task access required.',
  'client A cannot complete a task in workspace B'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"cccccccc-cccc-4ccc-8ccc-cccccccccccc","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.workspaces),
  1::bigint,
  'client B sees only workspace B'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"dddddddd-dddd-4ddd-8ddd-dddddddddddd","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.workspaces),
  0::bigint,
  'uninvited user sees no workspace'
);

select is(
  (select count(*) from public.requests),
  0::bigint,
  'uninvited user sees no requests'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.workspaces),
  1::bigint,
  'operator sees only assigned workspace A'
);

select lives_ok(
  $$select public.respond_to_request('33333333-3333-4333-8333-333333333333', 'The next step is confirmed.')$$,
  'assigned operator can respond to workspace A request'
);

select throws_ok(
  $$select public.respond_to_request('44444444-4444-4444-8444-444444444444', 'Cross-workspace reply')$$,
  '42501',
  'Workspace operator access required.',
  'operator cannot respond in unassigned workspace B'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.request_replies
   where request_id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'client A sees the persisted operator response'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$select * from public.requests$$,
  '42501',
  'permission denied for table requests',
  'anonymous access to requests is denied'
);

select * from finish(true);
rollback;
