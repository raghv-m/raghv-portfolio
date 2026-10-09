-- CRM: notes and follow-up tasks per person, and projects linked to their contract/estimate.
-- People are keyed by email so notes and tasks work for leads who don't have an account yet.
-- All admin-only (RLS read for admin; writes through server actions behind TOTP).

create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  person_email text not null check (person_email = lower(person_email)),
  body text not null check (length(body) between 1 and 10000),
  pinned boolean not null default false,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  person_email text check (person_email is null or person_email = lower(person_email)),
  title text not null check (length(title) between 1 and 300),
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_crm_notes_person on public.crm_notes (person_email, created_at desc);
create index idx_crm_tasks_open on public.crm_tasks (due_at) where done_at is null;
create index idx_crm_tasks_person on public.crm_tasks (person_email, created_at desc);

-- Projects remember where they came from.
alter table public.projects
  add column contract_id uuid references public.contracts (id) on delete set null,
  add column estimate_id uuid references public.estimates (id) on delete set null,
  add column value_cents integer not null default 0 check (value_cents >= 0);

alter table public.crm_notes enable row level security;
alter table public.crm_tasks enable row level security;
create policy "admin reads notes" on public.crm_notes for select to authenticated using ((select public.is_admin()));
create policy "admin reads tasks" on public.crm_tasks for select to authenticated using ((select public.is_admin()));
