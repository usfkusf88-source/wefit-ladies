-- Optional: demo leads for previewing the dashboard. Safe to skip in production.
-- Run AFTER migrations. Delete these rows before go-live.

insert into public.leads (full_name, phone, source, membership, services, workout_time, district, status, wants_offers, consent, age)
values
  ('سارة العتيبي', '966501112233', 'instagram', 'annual',  array['gym','pilates'],       'evening',   'المهدية', 'new',           true, true, 27),
  ('نورة القحطاني','966502223344', 'snapchat',  'monthly', array['reformer_pilates'],     'morning',   'النرجس',  'contacted',     true, true, 31),
  ('لمى الشهري',   '966503334455', 'tiktok',    '6_months',array['cardio','strength'],    'evening',   'الياسمين','interested',    true, true, 24),
  ('هيا الدوسري',  '966504445566', 'friend',    'annual',  array['pool','swim_classes'],  'afternoon', 'حطين',    'joined',        true, true, 29),
  ('ريم المطيري',  '966505556677', 'qr',        '3_months',array['group_classes','sauna'],'flexible',  'الملقا',  'visit_scheduled',true,true, 22),
  ('أمل الغامدي',  '966506667788', 'influencer','not_sure',array['personal_training'],    'morning',   'الصحافة', 'follow_up',     true, true, 35),
  ('جواهر السبيعي','966507778899', 'outdoor',   'monthly', array['gym','recovery'],       'evening',   'المهدية', 'not_interested',false,true, 41)
on conflict (phone) do nothing;
