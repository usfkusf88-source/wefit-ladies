-- ═══════════════════════════════════════════════════════════════
-- WEFIT Ladies — Schema (0001_init)
-- Tables, indexes, helper functions, triggers.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ── profiles (mirrors auth.users, holds role) ──────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'sales_agent'
              check (role in ('admin','manager','sales_agent')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── campaigns ──────────────────────────────────────────────────
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  channel       text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  active        boolean not null default true,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ── leads ──────────────────────────────────────────────────────
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  phone           text not null unique,          -- canonical 9665XXXXXXXX
  phone_raw       text,
  email           text,
  age             int check (age is null or (age between 10 and 100)),
  district        text,
  source          text,
  membership      text,
  services        text[] not null default '{}',
  workout_time    text,
  wants_offers    boolean not null default true,
  heard_about     text,
  status          text not null default 'new'
                  check (status in ('new','not_contacted','contacted','interested',
                                    'visit_scheduled','follow_up','joined',
                                    'not_interested','wrong_number')),
  campaign_id     uuid references public.campaigns(id) on delete set null,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  assigned_to     uuid references public.profiles(id) on delete set null,
  last_contact_at timestamptz,
  duplicate_count int not null default 0,
  consent         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists leads_status_idx      on public.leads(status);
create index if not exists leads_assigned_idx     on public.leads(assigned_to);
create index if not exists leads_campaign_idx      on public.leads(campaign_id);
create index if not exists leads_created_idx        on public.leads(created_at desc);
create index if not exists leads_district_idx        on public.leads(district);
create index if not exists leads_source_idx           on public.leads(source);
create index if not exists leads_phone_idx             on public.leads(phone);
create index if not exists leads_name_trgm_idx on public.leads using gin (full_name gin_trgm_ops);

-- ── lead_notes ─────────────────────────────────────────────────
create table if not exists public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists lead_notes_lead_idx on public.lead_notes(lead_id, created_at desc);

-- ── lead_status_history ────────────────────────────────────────
create table if not exists public.lead_status_history (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  from_status     text,
  to_status       text not null,
  changed_by      uuid references public.profiles(id) on delete set null,
  changed_by_name text,
  created_at      timestamptz not null default now()
);
create index if not exists lead_status_history_lead_idx on public.lead_status_history(lead_id, created_at desc);

-- ── follow_ups ─────────────────────────────────────────────────
create table if not exists public.follow_ups (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at      timestamptz not null,
  note        text,
  done        boolean not null default false,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists follow_ups_due_idx on public.follow_ups(due_at) where done = false;
create index if not exists follow_ups_lead_idx on public.follow_ups(lead_id);

-- ── activity_logs ──────────────────────────────────────────────
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_name  text,
  action      text not null,
  entity      text,
  entity_id   text,
  meta        jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_actor_idx on public.activity_logs(actor_id);

-- ── settings (single row, id = 1) ──────────────────────────────
create table if not exists public.settings (
  id                integer primary key default 1 check (id = 1),
  brand_name        text not null default 'WEFIT Ladies',
  contact_email     text not null default 'info@wefitgymsa.com',
  phone             text,
  logo_url          text,
  primary_color     text not null default '#0A0A0B',
  accent_color      text not null default '#E14FA0',
  social_instagram  text,
  social_snapchat   text,
  social_tiktok     text,
  privacy_policy    text,
  terms             text,
  opening_date      date,
  updated_at        timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Functions & triggers
-- ═══════════════════════════════════════════════════════════════

-- Keep updated_at fresh on leads.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_leads_touch on public.leads;
create trigger trg_leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- Auto-record status changes into lead_status_history.
create or replace function public.record_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.lead_status_history(lead_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end; $$;

drop trigger if exists trg_leads_status on public.leads;
create trigger trg_leads_status after update on public.leads
  for each row execute function public.record_status_change();

-- On new auth user → create a profile (default sales_agent, inactive until an
-- admin promotes/activates, except the very first user who becomes admin).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from public.profiles;
  insert into public.profiles(id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    case when existing_count = 0 then 'admin'
         else coalesce(new.raw_user_meta_data->>'role','sales_agent') end,
    case when existing_count = 0 then true else true end
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public lead upsert with duplicate handling by normalized phone.
-- Returns (lead_id, was_duplicate).
create or replace function public.upsert_lead(
  p_full_name   text,
  p_phone       text,
  p_phone_raw   text,
  p_email       text,
  p_age         int,
  p_district    text,
  p_source      text,
  p_membership  text,
  p_services    text[],
  p_workout_time text,
  p_wants_offers boolean,
  p_consent     boolean,
  p_campaign_id uuid,
  p_utm_source  text,
  p_utm_medium  text,
  p_utm_campaign text,
  p_utm_content text
) returns table(lead_id uuid, was_duplicate boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select id into v_id from public.leads where phone = p_phone;

  if v_id is not null then
    -- Duplicate: enrich existing record without overwriting non-null fields.
    update public.leads set
      full_name       = coalesce(nullif(p_full_name,''), full_name),
      email           = coalesce(email, nullif(p_email,'')),
      age             = coalesce(age, p_age),
      district        = coalesce(district, nullif(p_district,'')),
      membership      = coalesce(membership, nullif(p_membership,'')),
      services        = case when array_length(services,1) is null then p_services else services end,
      workout_time    = coalesce(workout_time, nullif(p_workout_time,'')),
      wants_offers    = p_wants_offers or wants_offers,
      duplicate_count = duplicate_count + 1,
      updated_at      = now()
    where id = v_id;
    return query select v_id, true;
  else
    insert into public.leads(
      full_name, phone, phone_raw, email, age, district, source, membership,
      services, workout_time, wants_offers, heard_about, consent, campaign_id,
      utm_source, utm_medium, utm_campaign, utm_content, status
    ) values (
      p_full_name, p_phone, p_phone_raw, nullif(p_email,''), p_age, nullif(p_district,''),
      p_source, nullif(p_membership,''), p_services, nullif(p_workout_time,''),
      p_wants_offers, p_source, p_consent, p_campaign_id,
      p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, 'new'
    ) returning id into v_id;
    return query select v_id, false;
  end if;
end; $$;
