-- Client onboarding: a questionnaire the client fills in from their portal, then a services
-- agreement drafted from it that the client signs on the site.
--
-- Writes happen only through server code (admin actions behind TOTP, or the signed-in client's
-- own submit/sign actions, which re-check ownership and state). RLS here only grants reads.

create sequence public.contract_number_seq;

create table public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  estimate_id uuid references public.estimates (id) on delete set null,
  status text not null default 'sent' check (status in ('sent', 'submitted')),
  answers jsonb not null default '{}',
  sent_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  number text not null unique
    default ('CON-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.contract_number_seq')::text, 4, '0')),
  client_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  estimate_id uuid references public.estimates (id) on delete set null,
  questionnaire_id uuid references public.questionnaires (id) on delete set null,
  title text not null default 'Website Development Services Agreement',
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'void')),
  -- the filled-in values (client legal name, scope, fee, schedule, payment methods...)
  variables jsonb not null default '{}',
  -- the agreement text (markdown-ish: "## " headings, "- " bullets), frozen once sent
  body text not null default '',
  -- sha256 of body at the moment it was sent; recorded again on signing to prove it didn't change
  body_sha256 text,
  sent_at timestamptz,
  provider_signature_name text,
  provider_signed_at timestamptz,
  client_signature_name text,
  client_signature_title text,
  client_signed_at timestamptz,
  client_ip_hash text,
  client_user_agent text,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_questionnaires_client on public.questionnaires (client_id, created_at desc);
create index idx_contracts_client on public.contracts (client_id, created_at desc);
create index idx_contracts_status on public.contracts (status, created_at desc);
create trigger contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

-- A signed contract can't be edited or un-signed by anyone (voiding is the only exit, and keeps the record).
create function public.contracts_lock_signed() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status = 'signed' and (
       new.body is distinct from old.body or new.variables is distinct from old.variables
    or new.client_signature_name is distinct from old.client_signature_name
    or new.client_signed_at is distinct from old.client_signed_at
    or new.body_sha256 is distinct from old.body_sha256
    or new.status not in ('signed', 'void')) then
    raise exception 'signed contracts are locked';
  end if;
  return new;
end;
$$;
create trigger contracts_lock_signed before update on public.contracts
  for each row execute function public.contracts_lock_signed();

alter table public.questionnaires enable row level security;
alter table public.contracts enable row level security;

create policy "client reads own questionnaires" on public.questionnaires
  for select to authenticated
  using (client_id = (select auth.uid()) or (select public.is_admin()));

create policy "client reads own sent contracts" on public.contracts
  for select to authenticated
  using ((client_id = (select auth.uid()) and status <> 'draft') or (select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('contracts', 'contracts', false, 10485760)
on conflict (id) do nothing;

alter table public.email_sends drop constraint email_sends_type_check;
alter table public.email_sends add constraint email_sends_type_check
  check (type in ('newsletter', 'newsletter_confirm', 'contact_reply', 'invoice_sent', 'admin_alert', 'estimate_sent',
                  'questionnaire_sent', 'contract_sent', 'contract_signed'));
alter table public.email_sends add column contract_id uuid references public.contracts (id) on delete set null;
