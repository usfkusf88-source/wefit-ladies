# Installation Guide

## Prerequisites
- **Node.js ≥ 18.18** (Node 20 recommended — see `.nvmrc`)
- **npm** (or pnpm/yarn)
- A free **Supabase** account — https://supabase.com

## 1. Install dependencies
```bash
npm install
```

## 2. Environment variables
Copy the example file and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

| Variable | Where to find it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://join.wefitgymsa.com`) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` | **No — server only** |

> ⚠️ Never commit `.env.local`. The service-role key bypasses RLS.

## 3. Database
Apply the migrations in `supabase/migrations/` — full walkthrough in
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

## 4. Run
```bash
npm run dev      # → http://localhost:3000
```
- Public page: `/`
- Admin: `/admin` (redirects to `/admin/login`)

## 5. Create your first admin
Create a user in **Supabase → Authentication → Users → Add user** (email + password,
"Auto Confirm"). The first user created is automatically promoted to **Admin** by a
database trigger. Sign in at `/admin/login`.

## Verify
```bash
npm run typecheck   # no type errors
npm run build       # production build succeeds
```
