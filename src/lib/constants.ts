/**
 * Single source of truth for all domain enums / option lists.
 * Values are stored in the DB; labels (Arabic + English) are for the UI.
 * This keeps the public form, the CRM filters, and the DB in sync.
 */

export type Bilingual = { value: string; ar: string; en: string };

// ── How did you hear about us? ────────────────────────────────
export const LEAD_SOURCES: Bilingual[] = [
  { value: "instagram", ar: "إنستغرام", en: "Instagram" },
  { value: "snapchat", ar: "سناب شات", en: "Snapchat" },
  { value: "tiktok", ar: "تيك توك", en: "TikTok" },
  { value: "friend", ar: "صديقة", en: "Friend" },
  { value: "outdoor", ar: "إعلان خارجي", en: "Outdoor Advertisement" },
  { value: "qr", ar: "رمز QR", en: "QR Code" },
  { value: "influencer", ar: "مؤثرة", en: "Influencer" },
  { value: "other", ar: "أخرى", en: "Other" },
];

// ── Preferred membership ──────────────────────────────────────
export const MEMBERSHIPS: Bilingual[] = [
  { value: "monthly", ar: "شهري", en: "Monthly" },
  { value: "3_months", ar: "3 أشهر", en: "3 Months" },
  { value: "6_months", ar: "6 أشهر", en: "6 Months" },
  { value: "annual", ar: "سنوي", en: "Annual" },
  { value: "not_sure", ar: "غير متأكدة", en: "Not Sure Yet" },
];

// ── Interested services (multi-select) ────────────────────────
export const SERVICES: Bilingual[] = [
  { value: "gym", ar: "صالة رياضية", en: "Gym" },
  { value: "pilates", ar: "بيلاتس", en: "Pilates" },
  { value: "reformer_pilates", ar: "ريفورمر بيلاتس", en: "Reformer Pilates" },
  { value: "group_classes", ar: "حصص جماعية", en: "Group Classes" },
  { value: "cardio", ar: "كارديو", en: "Cardio" },
  { value: "strength", ar: "تمارين القوة", en: "Strength Training" },
  { value: "personal_training", ar: "تدريب شخصي", en: "Personal Training" },
  { value: "pool", ar: "مسبح", en: "Swimming Pool" },
  { value: "swim_classes", ar: "حصص سباحة", en: "Swimming Classes" },
  { value: "sauna", ar: "ساونا", en: "Sauna" },
  { value: "recovery", ar: "منطقة الاستشفاء", en: "Recovery Zone" },
];

// ── Preferred workout time ────────────────────────────────────
export const WORKOUT_TIMES: Bilingual[] = [
  { value: "morning", ar: "صباحاً", en: "Morning" },
  { value: "afternoon", ar: "ظهراً", en: "Afternoon" },
  { value: "evening", ar: "مساءً", en: "Evening" },
  { value: "flexible", ar: "مرنة", en: "Flexible" },
];

// ── Lead status workflow ──────────────────────────────────────
export type LeadStatus =
  | "new"
  | "not_contacted"
  | "contacted"
  | "interested"
  | "visit_scheduled"
  | "follow_up"
  | "joined"
  | "not_interested"
  | "wrong_number";

export const LEAD_STATUSES: {
  value: LeadStatus;
  ar: string;
  en: string;
  color: string; // tailwind classes for badge
}[] = [
  { value: "new", ar: "جديدة", en: "New", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "not_contacted", ar: "لم يتم التواصل", en: "Not Contacted", color: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  { value: "contacted", ar: "تم التواصل", en: "Contacted", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "interested", ar: "مهتمة", en: "Interested", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { value: "visit_scheduled", ar: "زيارة مجدولة", en: "Visit Scheduled", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "follow_up", ar: "متابعة", en: "Follow Up", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "joined", ar: "انضمت", en: "Joined", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "not_interested", ar: "غير مهتمة", en: "Not Interested", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "wrong_number", ar: "رقم خاطئ", en: "Wrong Number", color: "bg-red-100 text-red-700 border-red-200" },
];

// Statuses that count a lead as a converted member.
export const CONVERTED_STATUSES: LeadStatus[] = ["joined"];

// ── Roles ─────────────────────────────────────────────────────
export type Role = "admin" | "manager" | "sales_agent";

export const ROLES: { value: Role; ar: string; en: string }[] = [
  { value: "admin", ar: "مدير النظام", en: "Admin" },
  { value: "manager", ar: "مدير", en: "Manager" },
  { value: "sales_agent", ar: "مندوبة مبيعات", en: "Sales Agent" },
];

// ── Yes / No ──────────────────────────────────────────────────
export const YES_NO: Bilingual[] = [
  { value: "yes", ar: "نعم", en: "Yes" },
  { value: "no", ar: "لا", en: "No" },
];

// Riyadh districts (extendable). Al Mahdiyah first as it's the branch area.
export const DISTRICTS: string[] = [
  "المهدية",
  "النرجس",
  "الياسمين",
  "العارض",
  "حطين",
  "الملقا",
  "الصحافة",
  "النخيل",
  "الربيع",
  "العقيق",
  "الوادي",
  "القيروان",
  "الملك فهد",
  "العليا",
  "السليمانية",
  "أخرى",
];

// Helper: resolve a label from a value list by current locale.
export function labelOf(list: Bilingual[], value: string | null, locale: "ar" | "en" = "ar"): string {
  if (!value) return "";
  const found = list.find((i) => i.value === value);
  return found ? found[locale] : value;
}

export function statusMeta(value: string) {
  return LEAD_STATUSES.find((s) => s.value === value) ?? LEAD_STATUSES[0];
}
