# Deployment Guide (Vercel)

## 1. Push to Git
Create a repository (GitHub/GitLab/Bitbucket) and push the project.

```bash
git init
git add .
git commit -m "WEFIT Ladies — initial"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import into Vercel
1. https://vercel.com → **Add New… → Project** → import your repo.
2. Framework preset: **Next.js** (auto-detected). Build command `next build`, output handled automatically.

## 3. Environment variables
In **Vercel → Project → Settings → Environment Variables**, add (Production + Preview):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | your production URL, e.g. `https://join.wefitgymsa.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (mark as **Sensitive**) |

> `NEXT_PUBLIC_SITE_URL` is used to build QR/registration links — set it to the real domain so printed QR codes point to production.

## 4. Deploy
Click **Deploy**. Vercel builds and hosts the app. Server Actions and middleware run on Vercel's serverless/edge runtime automatically.

## 5. Custom domain
**Vercel → Domains** → add `join.wefitgymsa.com` (or similar) and follow the DNS instructions. Update `NEXT_PUBLIC_SITE_URL` to match, then redeploy so QR links use the new domain.

## 6. Supabase Auth redirect (optional)
If you later enable email confirmation / magic links, add your production URL under
**Supabase → Authentication → URL Configuration → Site URL / Redirect URLs**.

## 7. Post-deploy checklist
- [ ] Migrations applied to the **production** Supabase project.
- [ ] First admin user created and can log in at `/admin/login`.
- [ ] Registration form submits and appears in **Admin → Leads**.
- [ ] Generate a QR in **Admin → Campaigns**, scan it, confirm the lead's campaign/UTM is captured.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain.
- [ ] Settings updated with real contact email / socials.

## Notes on runtime
- All admin pages and the public form are `dynamic` (server-rendered per request) — no stale caching of leads.
- Rate limiting is in-memory per instance. For high traffic across many instances, move it to Redis (see `SCALING.md`).
