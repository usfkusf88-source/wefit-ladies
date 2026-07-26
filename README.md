# WEFIT Ladies — Pre-Registration & Lead Management System

A production-ready, mobile-first, RTL (Arabic) web application for **WEFIT Ladies** (Al Mahdiyah – Riyadh). It combines a premium public **pre-registration landing page** with a full internal **CRM / lead-management dashboard**, a **QR campaign manager** with UTM tracking, analytics, reporting, role-based access, and a complete audit trail.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Postgres + Auth + RLS), **React Hook Form + Zod**, **Framer Motion**, **Recharts**, **Lucide Icons**, and **TanStack Table**.

---

## ✨ Features

### Public
- Premium Arabic RTL landing page (hero: **رحلتك تبدأ من هنا**) with luxury/minimal aesthetic inspired by Alo Yoga, Equinox, Nike, Apple.
- Full registration form: name, mobile (required), email, age, district, how-did-you-hear, preferred membership, multi-select services, preferred workout time, opening-offers opt-in, and a **privacy-policy consent** checkbox.
- Animated success state, `mailto:` contact, dynamic contact details from **Settings** (nothing hardcoded).
- Saudi phone **normalization** (`05…`, `9665…`, `+9665…` → canonical `9665XXXXXXXX`) and **duplicate detection**.
- Campaign/UTM capture from the URL (QR codes).

### Admin CRM
- Supabase email/password auth, middleware-protected `/admin`.
- Dashboard KPIs (total / today / week / month / converted / conversion rate) + 6 charts (daily growth, sources, memberships, services, districts, workout times) + recent registrations + upcoming follow-ups.
- Leads table (TanStack) with search, multi-filter, sorting, pagination, and CSV export.
- Lead detail: full profile, status timeline, notes, follow-ups, actions (call / email / copy / **export PDF** / edit / delete), color-coded status workflow.
- **QR Campaign Manager**: unlimited campaigns, auto UTM tags, live QR preview, download **PNG / SVG / high-res print poster**.
- Reports: date-range, campaign performance, employee performance, conversion — export **Excel / CSV / PDF**.
- Settings (contact, brand, colors, socials, privacy/terms, opening date), Users & Roles, and a full **Activity Log** (with IP).
- **Roles**: Admin (full), Manager (dashboard + team + reports), Sales Agent (assigned leads only) — enforced in both the UI and Postgres **Row Level Security**.

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# → fill in your Supabase URL + keys (see docs/SUPABASE_SETUP.md)

# 3. Apply the database migrations (see docs/SUPABASE_SETUP.md)

# 4. Run
npm run dev            # http://localhost:3000
```

The **first user** you create in Supabase Auth automatically becomes the **Admin** (via a DB trigger).

---

## 📁 Folder structure

```
wefit-ladies/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # Root layout (Arabic, RTL, Cairo font)
│  │  ├─ page.tsx  /  register/     # Public landing + registration (QR target)
│  │  ├─ privacy/  terms/           # Legal pages (content editable in Settings)
│  │  ├─ actions/register.ts        # Public registration server action
│  │  └─ admin/
│  │     ├─ login/                  # Login page + auth actions
│  │     └─ (app)/                  # Authenticated shell (sidebar)
│  │        ├─ page.tsx             # Dashboard
│  │        ├─ leads/               # Table, detail, actions
│  │        ├─ campaigns/           # QR campaign manager
│  │        ├─ reports/             # Reports + exports
│  │        ├─ users/               # User & role management
│  │        ├─ settings/            # Brand / contact settings
│  │        └─ activity/            # Activity log
│  ├─ components/                   # UI (public + admin)
│  ├─ lib/                          # supabase clients, validations, analytics, qr, export, rbac
│  └─ middleware.ts                 # Session refresh + route guard
├─ supabase/migrations/            # 0001_init, 0002_rls, 0003_seed
├─ supabase/seed_demo.sql          # Optional demo leads
├─ docs/                           # Installation, Supabase, Deployment, Scaling
└─ public/logos/                   # Brand assets
```

---

## 🧱 Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (custom brand tokens) |
| Backend / DB / Auth | Supabase (Postgres, Auth, RLS) |
| Forms / validation | React Hook Form + Zod |
| Animation | Framer Motion |
| Charts | Recharts |
| Tables | TanStack Table |
| Icons | Lucide |
| QR | `qrcode` |
| Spreadsheets | `xlsx` |

---

## 🔐 Security

- Row Level Security on every table; role-scoped access.
- Server Actions for all mutations (no public write endpoints).
- Service-role key is **server-only** (never shipped to the browser).
- Zod validation on every input; Saudi-phone normalization + uniqueness.
- In-memory rate limiting on registration + login (swap for Redis at scale — see `docs/SCALING.md`).
- Security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).

---

## 📚 Documentation

- [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — local setup
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — project, migrations, admin user, RLS
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploy to Vercel
- [`docs/SCALING.md`](docs/SCALING.md) — backups + future scaling

---

## 📜 Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # start production server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

© WEFIT Ladies — نحن اللياقة.
