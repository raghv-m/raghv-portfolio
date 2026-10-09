-- Daily security-news digests pushed by the LinkedIn autopost job (news_digest.py), shown on /news.
-- Only headlines, short excerpts and links to the original sources are stored.
create table public.news_digests (
  id uuid primary key default gen_random_uuid(),
  digest_date date not null unique,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger news_digests_updated_at before update on public.news_digests
  for each row execute function public.set_updated_at();

alter table public.news_digests enable row level security;
create policy "public reads news digests" on public.news_digests for select to anon, authenticated using (true);
-- Writes: only the server route, authenticated with INTEGRATION_API_KEY, using the service role.
