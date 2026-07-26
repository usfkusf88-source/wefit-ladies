-- ═══════════════════════════════════════════════════════════════
-- WEFIT Ladies — Seed data (0003_seed)
-- ═══════════════════════════════════════════════════════════════

-- Default settings row.
insert into public.settings (id, brand_name, contact_email, primary_color, accent_color)
values (1, 'WEFIT Ladies', 'info@wefitgymsa.com', '#0A0A0B', '#E14FA0')
on conflict (id) do nothing;

-- Starter campaigns (one per channel). Slugs are used in QR/UTM links.
insert into public.campaigns (name, slug, channel, utm_source, utm_medium, utm_campaign)
values
  ('Instagram Campaign', 'instagram', 'instagram', 'instagram', 'social', 'prereg'),
  ('Snapchat Campaign',  'snapchat',  'snapchat',  'snapchat',  'social', 'prereg'),
  ('TikTok Campaign',    'tiktok',    'tiktok',    'tiktok',    'social', 'prereg'),
  ('Outdoor Campaign',   'outdoor',   'outdoor',   'outdoor',   'print',  'prereg'),
  ('Reception',          'reception', 'reception', 'reception', 'onsite', 'prereg'),
  ('Influencer Campaign','influencer','influencer','influencer','social', 'prereg')
on conflict (slug) do nothing;
