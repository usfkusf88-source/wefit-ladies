# Supabase Setup

## 1. Create a project
1. Go to https://supabase.com → **New project**.
2. Choose a strong database password and a region close to Saudi Arabia (e.g. `eu-central-1` / `me-*` if available).
3. Once ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

## 2. Apply migrations

You have three options.

### Option A — SQL Editor (simplest)
Open **Supabase → SQL Editor** and run each file **in order**, pasting its contents:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_seed.sql`

*(Optional)* run `supabase/seed_demo.sql` to load demo leads for previewing the dashboard. Delete those rows before go-live.

### Option B — Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push          # applies everything in supabase/migrations
```

### Option C — psql
```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_seed.sql
```

## 3. What the migrations create
- **Tables**: `profiles`, `campaigns`, `leads`, `lead_notes`, `lead_status_history`, `follow_ups`, `activity_logs`, `settings`.
- **Functions**: `upsert_lead` (duplicate-safe public insert), `handle_new_user` (auto-profile + first-user-is-admin), `record_status_change` (auto status history), `touch_updated_at`.
- **RLS**: enabled on every table with admin / manager / sales-agent policies.
- **Seed**: default settings row + 6 starter campaigns (Instagram, Snapchat, TikTok, Outdoor, Reception, Influencer).

## 4. Create the first admin user
**Authentication → Users → Add user** → email + password → enable **Auto Confirm User**.
The `handle_new_user` trigger creates a matching `profiles` row; the **first** user becomes `admin` and `active`.

To promote later users, sign in as admin → **Admin → Users** → change their role / activate.

## 5. Regenerate types (optional, after schema changes)
```bash
supabase gen types typescript --project-id <ref> --schema public > src/lib/database.types.ts
```

## 6. Auth settings
- **Authentication → Providers → Email**: keep **Email** enabled.
- For an internal tool, you may **disable public sign-ups** (Authentication → Providers → Email → "Enable Sign-ups" off) so only admins create users. User creation still works because it goes through the service-role admin API.

## Troubleshooting
- **`SUPABASE_SERVICE_ROLE_KEY is not set`** → add it to `.env.local` (and to Vercel env vars).
- **Login works but `/admin` redirects to login** → the user has no `profiles` row or is inactive. Check the `profiles` table.
- **Duplicate phone** → expected: the app updates the existing lead and increments `duplicate_count`.
