-- ═══════════════════════════════════════════════════════════════
-- WEFIT Ladies — Row Level Security (0002_rls)
-- ═══════════════════════════════════════════════════════════════

-- Helper: current user's role.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and active = true);
$$;

create or replace function public.is_admin_or_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles
                where id = auth.uid() and active = true and role in ('admin','manager'));
$$;

-- Enable RLS everywhere.
alter table public.profiles            enable row level security;
alter table public.leads               enable row level security;
alter table public.lead_notes          enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.follow_ups          enable row level security;
alter table public.campaigns           enable row level security;
alter table public.activity_logs       enable row level security;
alter table public.settings            enable row level security;

-- ── profiles ───────────────────────────────────────────────────
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select using (is_staff());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage" on public.profiles
  for all using (current_role() = 'admin') with check (current_role() = 'admin');

-- ── leads ──────────────────────────────────────────────────────
-- Admin/Manager see all; Sales agents see only assigned.
drop policy if exists "leads select" on public.leads;
create policy "leads select" on public.leads
  for select using (
    is_admin_or_manager()
    or (is_staff() and assigned_to = auth.uid())
  );

-- Insert handled by service role (public form). Staff may also insert manually.
drop policy if exists "leads insert" on public.leads;
create policy "leads insert" on public.leads
  for insert with check (is_staff());

-- Admin/Manager update all; agents update only assigned.
drop policy if exists "leads update" on public.leads;
create policy "leads update" on public.leads
  for update using (
    is_admin_or_manager()
    or (is_staff() and assigned_to = auth.uid())
  );

-- Only admins delete leads.
drop policy if exists "leads delete" on public.leads;
create policy "leads delete" on public.leads
  for delete using (current_role() = 'admin');

-- ── lead_notes ─────────────────────────────────────────────────
drop policy if exists "notes select" on public.lead_notes;
create policy "notes select" on public.lead_notes
  for select using (
    is_admin_or_manager()
    or exists(select 1 from public.leads l where l.id = lead_id and l.assigned_to = auth.uid())
  );

drop policy if exists "notes insert" on public.lead_notes;
create policy "notes insert" on public.lead_notes
  for insert with check (
    is_admin_or_manager()
    or exists(select 1 from public.leads l where l.id = lead_id and l.assigned_to = auth.uid())
  );

-- ── lead_status_history (read-only for staff) ──────────────────
drop policy if exists "status history select" on public.lead_status_history;
create policy "status history select" on public.lead_status_history
  for select using (
    is_admin_or_manager()
    or exists(select 1 from public.leads l where l.id = lead_id and l.assigned_to = auth.uid())
  );

drop policy if exists "status history insert" on public.lead_status_history;
create policy "status history insert" on public.lead_status_history
  for insert with check (is_staff());

-- ── follow_ups ─────────────────────────────────────────────────
drop policy if exists "followups select" on public.follow_ups;
create policy "followups select" on public.follow_ups
  for select using (
    is_admin_or_manager() or assigned_to = auth.uid()
    or exists(select 1 from public.leads l where l.id = lead_id and l.assigned_to = auth.uid())
  );

drop policy if exists "followups manage" on public.follow_ups;
create policy "followups manage" on public.follow_ups
  for all using (
    is_admin_or_manager() or assigned_to = auth.uid()
    or exists(select 1 from public.leads l where l.id = lead_id and l.assigned_to = auth.uid())
  ) with check (is_staff());

-- ── campaigns ──────────────────────────────────────────────────
drop policy if exists "campaigns select" on public.campaigns;
create policy "campaigns select" on public.campaigns
  for select using (is_staff());

drop policy if exists "campaigns manage" on public.campaigns;
create policy "campaigns manage" on public.campaigns
  for all using (is_admin_or_manager()) with check (is_admin_or_manager());

-- ── activity_logs (admin/manager read; inserts via service role) ─
drop policy if exists "activity select" on public.activity_logs;
create policy "activity select" on public.activity_logs
  for select using (is_admin_or_manager());

-- ── settings ───────────────────────────────────────────────────
-- Anyone (even anon) can read settings for the public page branding.
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings
  for select using (true);

drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings
  for all using (current_role() = 'admin') with check (current_role() = 'admin');
