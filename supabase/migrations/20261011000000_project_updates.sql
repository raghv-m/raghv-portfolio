-- Progress timeline for client projects: updates posted by the admin, plus automatic entries
-- when a milestone is completed or the project status changes. Clients read their own
-- projects' timeline (same rule as milestones); all writes go through server actions.

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  kind text not null default 'update' check (kind in ('update', 'milestone', 'status')),
  -- Set on automatic "milestone completed" entries, so un-ticking the milestone removes it.
  milestone_id uuid references public.milestones (id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  body text check (body is null or length(body) <= 10000),
  -- Optional preview or staging link. https only, so a link can't run script.
  link_url text check (link_url is null or link_url ~* '^https://'),
  created_at timestamptz not null default now()
);

create index idx_project_updates_project on public.project_updates (project_id, created_at desc);

-- When each milestone was completed, for the timeline.
alter table public.milestones add column completed_at timestamptz;
update public.milestones set completed_at = created_at where completed and completed_at is null;

alter table public.project_updates enable row level security;
create policy "tenant reads project updates" on public.project_updates
  for select to authenticated
  using (public.can_access_project(project_id));

alter publication supabase_realtime add table public.project_updates;
