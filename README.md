# raghv.dev

Portfolio, blog and freelance business back office for Raghav Mahajan (web development and cybersecurity, Edmonton).

## What's in it

- **Public site**: home, projects, about, experience, certifications, homelab, cybersecurity, career, contact, legal pages, blog (MDX), and `/news` (daily top 3 security stories).
- **Project estimator** (`/estimate`): instant price range showing the market estimate and my price (45% of market). It saves the estimate, emails it, and creates the client's portal account.
- **Client portal** (`/portal`): onboarding questionnaire, e-signed services agreement, projects and milestones, messages, invoices.
- **Admin console** (`/admin`):
  - Supabase login plus mandatory TOTP two-factor
  - dashboard, pipeline, clients, estimates, pricing, invoices (PDF), contracts, projects, tasks, CRM notes, blog posts, newsletter, messages
- **Feeds and integrations**:
  - `/rss.xml`, `/blog/feed.json`, `/sitemap.xml`, `/robots.txt`
  - `POST /api/integrations/news-digest`, used by the [linkedin-autopost](https://github.com/raghv-m/linkedin-autopost) job

## Stack

| Part | Uses |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 |
| Logins, portal, CRM, invoices, contracts | Supabase: Postgres with row-level security, Auth, Storage, Realtime |
| Blog, contact form, newsletter | Prisma with Turso (libSQL) |
| Email | Resend over SMTP (nodemailer) |
| PDFs | pdfkit (invoices and signed contracts with a SHA-256 fingerprint) |
| Hosting | Vercel |

## Local development

```bash
npm install
cp .env.example .env.local      # fill in the values (see comments in the file)
npx prisma generate
npm run dev                     # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run lint` / `npx tsc --noEmit` | lint and type check |
| `npm run test:unit` | unit tests (2FA, invoices, estimator, contracts) |
| `npm run test:db` | database access-rule tests (in-memory Postgres, no network) |
| `npm run test:live` | smoke test against the live Supabase project |
| `npm run build` | production build |

After `test:live`, reset the contract number sequence if there are no real contracts. Never reset invoice numbers.

### Database changes

Supabase migrations live in `supabase/migrations/`. Apply each new file in the Supabase SQL editor (or with the Management API), then record it in `supabase_migrations.schema_migrations`. Add a matching check to `supabase/tests/rls.test.mjs`.

### Admin account

```bash
node --env-file=.env.local scripts/create-admin.mjs you@example.com "Your Name"
```

The password is random and never shown. Set your own with "Forgot password" at `/auth/login`, then enrol two-factor on first sign-in. Keep the backup codes somewhere safe.

### Vercel environment variables

```bash
bash scripts/sync-vercel-env.sh
```

This copies every filled-in value from `.env.local` to Vercel (Production, Preview, Development) without printing secrets, and removes the old NextAuth variables. You need `npx vercel login` first.

## Business settings

| File | What it sets |
|---|---|
| `src/config/site.ts` | public site facts, contact details, SEO metadata |
| `src/config/estimator.ts` | prices and the my-price ratio (`myPriceRatio`) |
| `src/config/invoicing.ts` | trade name, address, payment methods and terms, deposit, late interest, legal lines |

The mailing address goes only on invoices and contracts, never on the public site.

## Still to do

Work through these in order. The site works locally today. Production email and going live need steps 1 to 5.

- [ ] **1. Resend email**
  - create a new API key at resend.com and put it in `.env.local` as `RESEND_API_KEY`
  - add and verify the `raghv.dev` domain (Domains > Add, then the DNS records at your registrar). Until it's verified, Resend only delivers to your own address.
  - set `SMTP_FROM="Raghav Mahajan <hello@raghv.dev>"`
- [ ] **2. Turso**: create a new token (`turso db tokens create raghv-portfolio`) and put it in `TURSO_AUTH_TOKEN`. The old one was rotated out.
- [ ] **3. Google Maps** (optional): create a Places API key restricted to `raghv.dev/*` and `localhost:3000/*`, then put it in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Address autocomplete is off without it.
- [ ] **4. Sync Vercel**: `bash scripts/sync-vercel-env.sh`. This also sends `INTEGRATION_API_KEY` for the LinkedIn job.
- [ ] **5. Test end to end on a Vercel preview of `supabase-rebuild`:**
  1. Sign in to admin with 2FA.
  2. Submit an estimate.
  3. Receive the portal email.
  4. Fill in the questionnaire.
  5. Draft and sign a contract.
  6. Create and download an invoice.
  7. Reset a password.
- [ ] **6. Go live**: merge `supabase-rebuild` (it already includes `security-hardening-2`) into `master`. Vercel deploys `master` to raghv.dev.
- [ ] **7. Search Console**: after going live, submit `https://raghv.dev/sitemap.xml` (the verification file is already in `public/`).
- [ ] **8. LinkedIn autopost**: follow the [linkedin-autopost README](https://github.com/raghv-m/linkedin-autopost#readme). Its `WEBSITE_API_KEY` must equal `INTEGRATION_API_KEY` here.
- [ ] **9. Legal**:
  - have an Alberta lawyer review the contract template (`src/lib/contracts/template.ts`) and the privacy and terms pages
  - register the trade name "Raghv Digital" with Alberta Registries, then set `tradeNameRegistered: true` in `src/config/invoicing.ts`. Until then, documents use your legal name.
- [ ] **10. GST**: register for a GST number once revenue nears $30,000 in four quarters, then add it to `src/config/invoicing.ts`.

## Security

See [SECURITY.md](SECURITY.md).

Never commit `.env*` files. CI runs a Gitleaks secret scan, npm audit, type check, lint, tests and build on every push to `master`.
