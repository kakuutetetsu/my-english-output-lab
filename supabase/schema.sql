create table if not exists public.learning_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);
alter table public.learning_events enable row level security;
revoke all on public.learning_events from anon;
grant select, insert on public.learning_events to authenticated;
drop policy if exists own_events_read on public.learning_events;
create policy own_events_read on public.learning_events for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists own_events_insert on public.learning_events;
create policy own_events_insert on public.learning_events for insert to authenticated with check ((select auth.uid()) = user_id);
-- Events are immutable. No client UPDATE or DELETE permission is granted.
