-- raghv.dev on Supabase: schema, row-level security, storage and realtime.
--
-- Access model
--   * anon:          reads published blog posts. Nothing else. Newsletter sign-ups and contact
--                    messages go through server routes (rate limits, CSRF, double opt-in) that use
--                    the service role, so there are no public INSERT policies.
--   * authenticated: a client sees their own tenant's projects, milestones, files, messages and
--                    invoices, may post messages and upload files on their own projects, and may
--                    edit their own name/avatar. Everything else is read-only to them.
--   * admin:         a profile with role = 'admin'. Reads everything through RLS; every admin write
--                    goes through server code that has checked the session AND the TOTP step
--                    (lib/mfa.ts), then uses the service role. Supabase's JWT doesn't know about our
--                    TOTP, so RLS deliberately grants admins no write access of their own.
--   * service_role:  bypasses RLS (server only, never shipped to the browser).
--
-- Policy helpers are SECURITY DEFINER so a policy on `profiles` can ask "is this user an admin?"
-- without re-entering the policies on `profiles` (that self-reference is what causes Postgres'
-- "infinite recursion detected in policy" error).

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'client')),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  due_date timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  file_name text not null,
  -- Path inside the private `project-files` bucket: <project_id>/<uuid>-<file_name>
  file_path text not null unique,
  file_size integer check (file_size >= 0),
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null check (length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);

-- Invoice numbers come from a sequence: unique and gap-tolerant, never random.
create sequence public.invoice_number_seq;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  invoice_number text not null unique
    default ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0')),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  amount_due integer not null default 0 check (amount_due >= 0), -- cents, kept in sync by trigger
  amount_paid integer not null default 0 check (amount_paid >= 0),
  currency text not null default 'cad',
  due_date timestamptz not null,
  sent_date timestamptz,
  paid_date timestamptz,
  -- Path inside the private `invoices` bucket. Served only through short-lived signed URLs.
  pdf_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount integer not null check (unit_amount >= 0), -- cents
  amount integer generated always as (quantity * unit_amount) stored,
  sort_order integer not null default 0
);

-- Blog: keeps every field the current Prisma `Post` model has, so nothing is lost in migration.
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique, -- Prisma cuid, for the one-off data migration
  author_id uuid references public.profiles (id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null,
  category text not null default 'general',
  tags text[] not null default '{}',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  read_time integer,
  views integer not null default 0,
  notify_subscribers boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscribers: existing ones keep their unsubscribe tokens, so links already sent keep working.
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  confirmed boolean not null default false,
  confirmation_token text unique,
  active boolean not null default true,
  unsubscribe_token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table public.email_sends (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.blog_posts (id) on delete set null,
  invoice_id uuid references public.invoices (id) on delete set null,
  recipient_email text not null,
  type text not null check (type in ('newsletter', 'newsletter_confirm', 'contact_reply', 'invoice_sent', 'admin_alert')),
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text,
  sent_at timestamptz not null default now()
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip_hash text, -- hashed, never the raw IP (matches the current site)
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Carried over from the current site so the admin career tracker and page notes keep working.
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  applied_at timestamptz not null,
  status text not null default 'APPLIED',
  notes text,
  posting_url text,
  updated_at timestamptz not null default now()
);

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  content text not null,
  color text not null default 'yellow',
  position text not null default 'top-right',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text, -- text: some resources (legacy posts) don't have uuid ids
  changes jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- TOTP for the admin. Server-only: RLS is on with no policies, so only the service role can
-- read it. The secret is AES-256-GCM encrypted by the app (MFA_ENCRYPTION_KEY); backup codes are
-- stored as SHA-256 hashes; last_used_step blocks replaying a code inside its 30s window.
create table public.mfa_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  secret_encrypted text not null,
  backup_code_hashes text[] not null default '{}',
  enabled boolean not null default false,
  last_used_step bigint,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Indexes (unique constraints above already index email, slug, invoice_number, tokens)
-- ---------------------------------------------------------------------------------------------

create index idx_profiles_tenant on public.profiles (tenant_id);
create index idx_projects_tenant on public.projects (tenant_id);
create index idx_projects_client on public.projects (client_id);
create index idx_milestones_project on public.milestones (project_id, sort_order);
create index idx_project_files_project on public.project_files (project_id);
create index idx_messages_project on public.messages (project_id, created_at);
create index idx_invoices_tenant on public.invoices (tenant_id);
create index idx_invoices_client on public.invoices (client_id);
create index idx_invoices_status on public.invoices (status);
create index idx_line_items_invoice on public.invoice_line_items (invoice_id, sort_order);
create index idx_blog_published on public.blog_posts (published_at desc) where status = 'published';
create index idx_blog_category on public.blog_posts (category);
create index idx_subscribers_active on public.subscribers (active) where confirmed;
create index idx_contact_unread on public.contact_submissions (read, created_at desc);
create index idx_audit_actor on public.audit_logs (actor_id, created_at desc);
create index idx_audit_resource on public.audit_logs (resource_type, created_at desc);

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();
create trigger job_applications_updated_at before update on public.job_applications
  for each row execute function public.set_updated_at();
create trigger mfa_secrets_updated_at before update on public.mfa_secrets
  for each row execute function public.set_updated_at();

-- An invoice's total is always the sum of its line items, never a number typed in separately.
create function public.sync_invoice_total() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target uuid := coalesce(new.invoice_id, old.invoice_id);
begin
  update public.invoices
     set amount_due = coalesce((select sum(amount) from public.invoice_line_items where invoice_id = target), 0)
   where id = target;
  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    update public.invoices
       set amount_due = coalesce((select sum(amount) from public.invoice_line_items where invoice_id = old.invoice_id), 0)
     where id = old.invoice_id;
  end if;
  return null;
end;
$$;

create trigger invoice_line_items_total after insert or update or delete on public.invoice_line_items
  for each row execute function public.sync_invoice_total();

-- Audit logs are append-only for everyone, the service role included.
create function public.audit_logs_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

create trigger audit_logs_no_update before update or delete on public.audit_logs
  for each row execute function public.audit_logs_immutable();
create trigger audit_logs_no_truncate before truncate on public.audit_logs
  for each statement execute function public.audit_logs_immutable();

-- ---------------------------------------------------------------------------------------------
-- Policy helpers (SECURITY DEFINER: they read profiles without re-entering profiles' policies)
-- ---------------------------------------------------------------------------------------------

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.role = 'admin' from public.profiles p where p.id = (select auth.uid())), false);
$$;

create function public.current_tenant_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.tenant_id from public.profiles p where p.id = (select auth.uid());
$$;

-- True when the signed-in user may see this project (their tenant's, or they're the admin).
create function public.can_access_project(target_project uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin()
      or exists (
        select 1 from public.projects pr
         where pr.id = target_project and pr.tenant_id = public.current_tenant_id()
      );
$$;

-- Storage object names start with the project id. Anything that isn't a uuid maps to null (and so
-- to "no access") instead of making the policy throw a cast error.
create function public.project_id_from_path(object_name text) returns uuid
language sql immutable set search_path = '' as $$
  select case
    when split_part(object_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(object_name, '/', 1)::uuid
  end;
$$;

revoke execute on function public.is_admin(), public.current_tenant_id(), public.can_access_project(uuid) from public, anon;
grant execute on function public.is_admin(), public.current_tenant_id(), public.can_access_project(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.project_files enable row level security;
alter table public.messages enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscribers enable row level security;
alter table public.email_sends enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.job_applications enable row level security;
alter table public.annotations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.mfa_secrets enable row level security;

-- Tenants
create policy "tenant members and admin read tenants" on public.tenants
  for select to authenticated
  using (id = (select public.current_tenant_id()) or (select public.is_admin()));

-- Profiles: read your own (admin reads all); update only name/avatar on your own row.
create policy "read own profile or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- Column-level: role, tenant_id and email can't be changed through the API, even on your own row.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Projects, milestones, invoices, line items: tenant read; writes are admin-via-server only.
create policy "tenant reads projects" on public.projects
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()) or (select public.is_admin()));

create policy "tenant reads milestones" on public.milestones
  for select to authenticated
  using (public.can_access_project(project_id));

create policy "tenant reads invoices" on public.invoices
  for select to authenticated
  using (
    (tenant_id = (select public.current_tenant_id()) and status <> 'draft')
    or (select public.is_admin())
  );

create policy "tenant reads invoice line items" on public.invoice_line_items
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
     where i.id = invoice_id
       and ((i.tenant_id = (select public.current_tenant_id()) and i.status <> 'draft') or (select public.is_admin()))
  ));

-- Files: read on your projects; upload as yourself to your projects.
create policy "tenant reads project files" on public.project_files
  for select to authenticated
  using (public.can_access_project(project_id));
create policy "tenant uploads project files" on public.project_files
  for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and public.can_access_project(project_id));

-- Messages: read on your projects; post only as yourself.
create policy "tenant reads messages" on public.messages
  for select to authenticated
  using (public.can_access_project(project_id));
create policy "tenant posts messages as self" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.can_access_project(project_id));

-- Blog: anyone reads published posts; admin reads drafts too.
create policy "public reads published posts" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');
create policy "admin reads all posts" on public.blog_posts
  for select to authenticated
  using ((select public.is_admin()));

-- Admin-only reads (all writes: service role from server routes).
create policy "admin reads subscribers" on public.subscribers
  for select to authenticated using ((select public.is_admin()));
create policy "admin reads email sends" on public.email_sends
  for select to authenticated using ((select public.is_admin()));
create policy "admin reads contact submissions" on public.contact_submissions
  for select to authenticated using ((select public.is_admin()));
create policy "admin reads job applications" on public.job_applications
  for select to authenticated using ((select public.is_admin()));
create policy "admin reads annotations" on public.annotations
  for select to authenticated using ((select public.is_admin()));
create policy "admin reads audit logs" on public.audit_logs
  for select to authenticated using ((select public.is_admin()));
-- mfa_secrets: RLS on, no policies at all. Service role only.

-- ---------------------------------------------------------------------------------------------
-- Storage: two private buckets
-- ---------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('project-files', 'project-files', false, 52428800), -- 50 MB
  ('invoices', 'invoices', false, 10485760)            -- 10 MB, written by the server only
on conflict (id) do nothing;

-- project-files objects live at <project_id>/<file>. Clients read and upload inside their own
-- projects; the invoices bucket has no policies, so only the service role touches it and clients
-- get PDFs through signed URLs created after an access check.
create policy "tenant reads project file objects" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-files'
    and public.can_access_project(public.project_id_from_path(name))
  );
create policy "tenant uploads project file objects" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and public.can_access_project(public.project_id_from_path(name))
  );

-- ---------------------------------------------------------------------------------------------
-- Realtime (RLS still applies to what each subscriber receives)
-- ---------------------------------------------------------------------------------------------

alter publication supabase_realtime add table public.projects, public.milestones, public.messages, public.invoices;
