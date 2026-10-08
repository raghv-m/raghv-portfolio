-- Project estimator: an editable price list and the estimates clients submit.
--
-- pricing_items holds every priced option shown on /estimate. Admin edits prices in the console
-- (server + TOTP, service role); the public page reads active items through RLS.
-- estimates are written only by the server route (rate-limited, validated) with a price snapshot,
-- so later price edits never change an estimate a client already received.

create table public.pricing_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('category', 'feature', 'integration', 'hosting', 'addon')),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  label text not null,
  description text not null default '',
  -- Lucide icon name for the picker (e.g. 'shopping-cart'); null = default icon
  icon text,
  -- one-time price in cents (for a category: the base build, covering included_pages)
  price_cents integer not null default 0 check (price_cents >= 0),
  -- recurring monthly price in cents (hosting, maintenance plans)
  monthly_cents integer not null default 0 check (monthly_cents >= 0),
  -- categories only: pages covered by the base price, and the price of each extra page
  included_pages integer not null default 0 check (included_pages >= 0),
  per_page_cents integer not null default 0 check (per_page_cents >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index idx_pricing_items_section on public.pricing_items (section, sort_order) where active;
create trigger pricing_items_updated_at before update on public.pricing_items
  for each row execute function public.set_updated_at();

create sequence public.estimate_number_seq;

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default ('EST-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.estimate_number_seq')::text, 4, '0')),
  status text not null default 'new' check (status in ('new', 'reviewed', 'quoted', 'converted', 'declined')),
  -- contact
  name text not null,
  email text not null,
  company text,
  phone text,
  -- location (Google Places), all optional
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text,
  place_id text,
  -- what they asked for
  category_slug text not null,
  pages integer not null check (pages between 1 and 500),
  selections jsonb not null default '{}', -- { features: [], integrations: [], hosting: slug|null, addons: [] }
  description text,
  timeline text,
  budget text,
  -- price snapshot at submission time
  line_items jsonb not null default '[]', -- [{ label, detail, oneTimeCents, monthlyCents }]
  one_time_cents integer not null check (one_time_cents >= 0),
  one_time_low_cents integer not null,
  one_time_high_cents integer not null,
  monthly_cents integer not null default 0,
  currency text not null default 'cad',
  -- admin side
  admin_notes text,
  invoice_id uuid references public.invoices (id) on delete set null,
  client_id uuid references public.profiles (id) on delete set null,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_estimates_status on public.estimates (status, created_at desc);
create index idx_estimates_email on public.estimates (lower(email));
create trigger estimates_updated_at before update on public.estimates
  for each row execute function public.set_updated_at();

alter table public.pricing_items enable row level security;
alter table public.estimates enable row level security;

-- Anyone may read the active price list (it's what /estimate shows); admin reads inactive too.
create policy "public reads active pricing" on public.pricing_items
  for select to anon, authenticated using (active);
create policy "admin reads all pricing" on public.pricing_items
  for select to authenticated using ((select public.is_admin()));

-- Estimates: admin reads; a client signed in with the same email sees their own.
create policy "admin reads estimates" on public.estimates
  for select to authenticated using ((select public.is_admin()));
create policy "clients read own estimates" on public.estimates
  for select to authenticated
  using (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), '')));

-- email_sends: allow logging estimate emails too
alter table public.email_sends drop constraint email_sends_type_check;
alter table public.email_sends add constraint email_sends_type_check
  check (type in ('newsletter', 'newsletter_confirm', 'contact_reply', 'invoice_sent', 'admin_alert', 'estimate_sent'));
alter table public.email_sends add column estimate_id uuid references public.estimates (id) on delete set null;

-- ---------------------------------------------------------------------------------------------
-- Starting price list (CAD). Every number here is editable in the admin console.
-- ---------------------------------------------------------------------------------------------

insert into public.pricing_items (section, slug, label, description, icon, price_cents, included_pages, per_page_cents, sort_order) values
  ('category', 'landing-page',        'Landing page',              'One focused page to launch, promote or collect sign-ups.',            'rocket',          80000,  1,  15000,  1),
  ('category', 'portfolio',           'Portfolio',                 'Show your work: galleries, case studies, about and contact.',        'image',          150000,  5,  15000,  2),
  ('category', 'business-website',    'Business website',          'A professional site for a small or local business.',                 'briefcase',      250000,  5,  20000,  3),
  ('category', 'restaurant-cafe',     'Restaurant / café',         'Menus, hours, reservations and online ordering links.',              'utensils',       250000,  5,  20000,  4),
  ('category', 'real-estate',         'Real estate',               'Listings, agent profiles, search and enquiry forms.',                'home',           450000,  8,  22500,  5),
  ('category', 'medical-clinic',      'Medical / clinic',          'Services, practitioners, booking and privacy-minded forms.',         'stethoscope',    400000,  6,  22500,  6),
  ('category', 'law-firm',            'Law / professional firm',   'Practice areas, team bios, intake forms and trust signals.',         'scale',          350000,  6,  20000,  7),
  ('category', 'construction-trades', 'Construction / trades',     'Services, project gallery, service areas and quote requests.',       'hammer',         275000,  5,  20000,  8),
  ('category', 'beauty-salon',        'Salon / beauty / spa',      'Services, pricing, booking and stylist profiles.',                   'sparkles',       250000,  5,  20000,  9),
  ('category', 'fitness',             'Gym / fitness',             'Classes, schedules, memberships and trainer profiles.',              'dumbbell',       300000,  6,  20000, 10),
  ('category', 'nonprofit',           'Non-profit / charity',      'Mission, programs, volunteering and donation links.',                'heart-handshake',250000,  6,  17500, 11),
  ('category', 'church-community',    'Church / community group',  'Events, groups, livestream links and announcements.',                'users',          200000,  5,  15000, 12),
  ('category', 'education',           'School / tutoring',         'Programs, enrolment, schedules and resources.',                      'graduation-cap', 350000,  6,  20000, 13),
  ('category', 'events-wedding',      'Event / wedding',           'Schedule, RSVP, venue info and photo galleries.',                    'calendar-heart', 150000,  4,  12500, 14),
  ('category', 'photography',         'Photography / creative',    'Image-first galleries, client proofing and bookings.',               'camera',         200000,  5,  15000, 15),
  ('category', 'blog-media',          'Blog / magazine',           'Articles, categories, authors and newsletter sign-up.',              'newspaper',      300000,  5,  15000, 16),
  ('category', 'ecommerce-small',     'Online store (up to 50 products)', 'Product catalogue, cart, checkout and order emails.',         'shopping-cart',  500000,  8,  20000, 17),
  ('category', 'ecommerce-large',     'Online store (50+ products)', 'Larger catalogue, filters, variants, inventory and shipping.',     'store',          950000, 12,  25000, 18),
  ('category', 'booking-platform',    'Booking / appointments',    'Calendars, availability, reminders and payments.',                   'calendar-check', 600000,  6,  25000, 19),
  ('category', 'membership',          'Membership / courses',      'Member accounts, gated content, lessons and progress.',              'badge-check',    800000,  8,  25000, 20),
  ('category', 'directory',           'Directory / listings',      'Searchable listings with categories, maps and submissions.',         'list',           700000,  8,  25000, 21),
  ('category', 'marketplace',         'Marketplace',               'Buyers and sellers, listings, messaging and payouts.',               'store',         1800000, 12,  30000, 22),
  ('category', 'saas-mvp',            'SaaS / web app MVP',        'Accounts, dashboard, core feature set and billing.',                 'layout-dashboard',1500000, 8,  30000, 23),
  ('category', 'internal-dashboard',  'Internal tool / dashboard', 'Admin panels, reports and workflows for your team.',                 'bar-chart-3',    900000,  6,  30000, 24),
  ('category', 'mobile-pwa',          'Mobile app (PWA)',          'Installable app that works on phones, offline-friendly.',            'smartphone',    1200000,  6,  30000, 25),
  ('category', 'security-audit',      'Security review / hardening','Audit of an existing site: headers, auth, dependencies, fixes.',    'shield-check',   120000,  0,      0, 26),
  ('category', 'redesign',            'Redesign of an existing site','New look and structure for a site you already have.',              'paintbrush',     200000,  5,  17500, 27);

insert into public.pricing_items (section, slug, label, description, icon, price_cents, monthly_cents, sort_order) values
  ('feature', 'contact-form',      'Contact / enquiry forms',      'Spam-protected forms that email you.',                       'mail',            15000, 0,  1),
  ('feature', 'blog-cms',          'Blog / news (editable)',       'Write and publish posts yourself.',                          'pen-square',      60000, 0,  2),
  ('feature', 'cms',               'Edit-it-yourself content',     'Change text and images without a developer.',               'file-pen',        90000, 0,  3),
  ('feature', 'user-accounts',     'User accounts & login',        'Sign-up, login, password reset, profiles.',                  'user',           120000, 0,  4),
  ('feature', 'admin-dashboard',   'Admin dashboard',              'Manage content, users and orders in one place.',             'layout-dashboard',150000, 0,  5),
  ('feature', 'booking',           'Online booking',               'Customers pick a time; you get notified.',                   'calendar',        90000, 0,  6),
  ('feature', 'search-filters',    'Search & filters',             'Find things fast across your content or products.',          'search',          60000, 0,  7),
  ('feature', 'multilingual',      'Multiple languages',           'English plus one more language (e.g. French).',              'languages',       80000, 0,  8),
  ('feature', 'seo-setup',         'SEO setup',                    'Metadata, sitemap, schema, Google Search Console.',          'trending-up',     45000, 0,  9),
  ('feature', 'analytics',         'Analytics & consent banner',   'Google Analytics with a privacy-compliant cookie banner.',   'bar-chart',       25000, 0, 10),
  ('feature', 'accessibility',     'Accessibility (WCAG 2.1 AA)',  'Built and checked for keyboard and screen-reader users.',    'accessibility',   50000, 0, 11),
  ('feature', 'animations',        'Custom animations',            'Polished motion and interactive sections.',                  'wand-2',          60000, 0, 12),
  ('feature', 'file-uploads',      'File uploads',                 'Let users upload documents or images securely.',             'upload',          50000, 0, 13),
  ('feature', 'notifications',     'Email notifications',          'Automatic emails for sign-ups, orders, bookings.',           'bell',            40000, 0, 14),
  ('feature', 'copywriting',       'Copywriting',                  'Professional text for your pages (per site).',               'type',            75000, 0, 15),
  ('integration', 'stripe',        'Stripe payments',              'Card payments, receipts and refunds.',                       'credit-card',     70000, 0,  1),
  ('integration', 'paypal',        'PayPal',                       'PayPal checkout buttons.',                                   'wallet',          40000, 0,  2),
  ('integration', 'google-maps',   'Google Maps',                  'Maps, locations and address autocomplete.',                  'map-pin',         30000, 0,  3),
  ('integration', 'calendly',      'Calendly / Cal.com',           'Embed your existing scheduling.',                            'calendar-clock',  15000, 0,  4),
  ('integration', 'mailchimp',     'Mailchimp / newsletter',       'Grow and email your list.',                                  'send',            25000, 0,  5),
  ('integration', 'crm',           'CRM (HubSpot, Zoho...)',       'Send leads straight into your CRM.',                         'contact',         60000, 0,  6),
  ('integration', 'social-feeds',  'Social media feeds',           'Instagram / Facebook posts on your site.',                   'share-2',         20000, 0,  7),
  ('integration', 'quickbooks',    'Accounting (QuickBooks)',      'Sync invoices or orders to your books.',                     'calculator',      90000, 0,  8),
  ('integration', 'ai-chatbot',    'AI chat assistant',            'Answers visitor questions from your content.',               'bot',            150000, 0,  9),
  ('integration', 'sms',           'SMS notifications',            'Text reminders and alerts (Twilio).',                        'message-square',  50000, 0, 10),
  ('integration', 'custom-api',    'Custom API integration',       'Connect any service with an API.',                           'plug',           120000, 0, 11);

insert into public.pricing_items (section, slug, label, description, icon, price_cents, monthly_cents, sort_order) values
  ('hosting', 'self-hosted',       'I''ll host it myself',         'Handover of code and deployment notes.',                     'server',              0,     0, 1),
  ('hosting', 'managed-basic',     'Managed hosting',              'Hosting, SSL, backups and uptime monitoring.',               'cloud',               0,  2500, 2),
  ('hosting', 'managed-pro',       'Managed hosting + care plan',  'Hosting plus updates, security patches and 1h of edits/month.','shield',            0,  9900, 3),
  ('addon', 'domain-setup',        'Domain & email setup',         'Connect your domain and set up business email.',             'globe',           10000, 0, 1),
  ('addon', 'logo-branding',       'Logo & brand kit',             'Logo, colours and fonts to match.',                          'palette',         60000, 0, 2),
  ('addon', 'training',            'Training session',             'One hour walkthrough of managing your site.',                'presentation',     8000, 0, 3),
  ('addon', 'rush',                'Rush delivery',                'Priority scheduling. Adds 25% to the one-time build.',       'zap',                 0, 0, 4);
