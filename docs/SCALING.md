# Backup Strategy & Future Scaling

## Backups
- **Supabase automated backups**: Pro plan includes daily backups + Point-in-Time Recovery (PITR). Enable PITR under **Database → Backups** for production.
- **Manual/export backup** (any plan):
  ```bash
  # Full logical dump
  pg_dump "$DATABASE_URL" -Fc -f wefit-backup-$(date +%F).dump
  # Restore
  pg_restore --clean --no-owner -d "$DATABASE_URL" wefit-backup-YYYY-MM-DD.dump
  ```
- **Leads export**: Admins can export all leads to Excel/CSV from **Admin → Reports** / **Admin → Leads** as an operational backup.
- Schedule a weekly `pg_dump` (GitHub Action / cron) to object storage (S3, Supabase Storage) and keep 4–8 rotations.

## Scaling recommendations

### Data volume
- Indexes are already defined on `leads` (`status`, `assigned_to`, `campaign_id`, `created_at`, `district`, `source`, `phone`) plus a trigram index on `full_name` for fast search.
- The dashboard/reports currently aggregate in the app. Beyond ~50k leads, move aggregation into SQL:
  - Create Postgres **views** or **materialized views** (e.g. `daily_lead_counts`, `campaign_stats`) and query those instead of pulling all rows.
  - Refresh materialized views on a schedule (Supabase cron / `pg_cron`).

### Rate limiting
- The built-in limiter (`src/lib/rate-limit.ts`) is per-instance and in-memory. For multiple serverless regions, switch to **Upstash Redis**:
  ```ts
  // pseudo — replace rateLimit() internals
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";
  const rl = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "1 m") });
  ```

### Pagination
- Leads are fetched fully then paginated client-side (fine for thousands). For very large datasets, switch to **server-side pagination** with `.range()` + count, and push filters into the query.

### Media / logos
- Store uploaded logos in **Supabase Storage** and set `settings.logo_url`. Serve via CDN.

### Internationalization (English)
- The data layer already stores stable enum **values**; UI labels are bilingual (`ar` / `en`) in `src/lib/constants.ts`. To add English:
  1. Introduce `next-intl` (or a simple locale context).
  2. Add `/en` routes / `dir="ltr"` switching in the root layout.
  3. Swap `labelOf(list, value, "en")` throughout. No schema change needed.

### Observability
- Add Vercel Analytics + Supabase logs.
- Consider Sentry for error tracking in Server Actions.

### Security hardening at scale
- Rotate the service-role key periodically.
- Add CAPTCHA (hCaptcha/Turnstile) to the public form if you see spam.
- Enable Supabase **Auth rate limits** and **email allow-lists** for the admin.
