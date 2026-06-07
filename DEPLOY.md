# Deployment Guide — raghv.dev

## Architecture

This is a **Next.js 16 monolith** — the "frontend" and "backend" (API routes) live in the
same app and are deployed together. The database is **Turso** (cloud SQLite, free tier).

```
Browser → Vercel (Next.js pages + API routes) → Turso DB
Browser → Render  (Next.js pages + API routes) → Turso DB  ← same DB
```

You can host on **either** Vercel or Render (or both pointing at the same Turso DB).
Recommended: **Vercel** for the primary live site (better Next.js integration, free tier),
**Render** as a warm standby or for webhook/cron jobs.

---

## Step 1 — Set up Turso (database)

1. Sign up free at https://turso.tech
2. Install the CLI: `npm install -g @tursodatabase/cli`
3. Login: `turso auth login`
4. Create your database:
   ```bash
   turso db create raghv-portfolio
   ```
5. Get the URL and token:
   ```bash
   turso db show raghv-portfolio --url
   turso db tokens create raghv-portfolio
   ```
6. Push the schema to Turso:
   ```bash
   DATABASE_URL="libsql://your-db.turso.io" TURSO_AUTH_TOKEN="your-token" npx prisma db push
   ```
   Save the URL and token — you'll need them in both Vercel and Render.

---

## Step 2 — Generate admin password hash

Run this in the project directory:
```bash
node -e "const b=require('bcryptjs'); b.hash('YourSecurePassword', 12).then(h => console.log(h))"
```
Copy the output (starts with `$2a$12$...`) — this is your `ADMIN_PASSWORD_HASH`.

---

## Step 3 — Set up Resend (email)

1. Sign up free at https://resend.com
2. Add and verify your sending domain (or use the sandbox for testing)
3. Create an API key — copy it as `RESEND_API_KEY`

---

## Step 4 — Push to GitHub

```bash
# In the project folder:
git remote add origin https://github.com/YOUR_USERNAME/raghv-portfolio.git
git branch -M main
git push -u origin main
```

---

## Step 5 — Deploy to Vercel (frontend + API)

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select `raghv-portfolio`
3. Framework: **Next.js** (auto-detected)
4. Add ALL environment variables (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | your Turso auth token |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | run `openssl rand -base64 32` |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD_HASH` | the bcrypt hash from Step 2 |
| `MAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | your Resend API key |
| `SMTP_FROM` | `Raghav Mahajan <you@yourdomain.com>` |
| `CONTACT_RECEIVER_EMAIL` | where contact emails go |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

5. Click **Deploy**. Build command is already set in `vercel.json`.
6. After deploy, update `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`
   if Vercel assigns a different URL.

---

## Step 6 — Deploy to Render (backend)

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Settings are in `render.yaml` (auto-detected), or set manually:
   - **Runtime**: Node
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
4. Add the same environment variables as Vercel (Step 5)
   but set `NEXTAUTH_URL` / `NEXT_PUBLIC_*` to your `.onrender.com` URL
5. Click **Create Web Service**

> **Note**: Render's free tier spins down after 15 min of inactivity (cold start ~30s).
> Upgrade to Starter ($7/mo) to keep it always-on.

---

## Post-deployment checklist

- [ ] Visit `https://your-site.vercel.app` — homepage loads
- [ ] Visit `/admin/login` — login works with your email + password
- [ ] Visit `/admin/posts` — create a test post
- [ ] Visit `/blog/your-test-slug` — post renders
- [ ] Submit the contact form — email arrives in inbox
- [ ] Subscribe with an email — welcome email arrives
- [ ] Visit `/admin/newsletter` — subscriber appears
- [ ] Check `/unsubscribe?token=...` — unsubscribe works
- [ ] Test on mobile — no horizontal scroll, hamburger menu slides in

---

## Custom domain (optional)

**Vercel**: Settings → Domains → Add `raghv.dev` → Follow DNS instructions
**Render**: Settings → Custom Domains → Add `api.raghv.dev` (if using as API backend)

After adding domain, update all `NEXTAUTH_URL` / `NEXT_PUBLIC_*` env vars to use it.

---

## Environment variables reference

See `.env.example` for all variables with descriptions.

Never commit `.env`, `.env.local`, or `.env.production` — they are in `.gitignore`.
