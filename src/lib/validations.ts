import { z } from "zod";
import { isValidSaudiPhone } from "./utils";
import { LEAD_SOURCES, MEMBERSHIPS, SERVICES, WORKOUT_TIMES, LEAD_STATUSES, ROLES } from "./constants";

const sourceValues = LEAD_SOURCES.map((s) => s.value) as [string, ...string[]];
const membershipValues = MEMBERSHIPS.map((m) => m.value) as [string, ...string[]];
const serviceValues = SERVICES.map((s) => s.value) as [string, ...string[]];
const timeValues = WORKOUT_TIMES.map((t) => t.value) as [string, ...string[]];
const statusValues = LEAD_STATUSES.map((s) => s.value) as [string, ...string[]];
const roleValues = ROLES.map((r) => r.value) as [string, ...string[]];

// ── Public registration form ──────────────────────────────────
export const registrationSchema = z.object({
  full_name: z
    .string({ required_error: "الاسم مطلوب" })
    .trim()
    .min(2, "الرجاء إدخال الاسم الكامل")
    .max(120, "الاسم طويل جداً"),
  phone: z
    .string({ required_error: "رقم الجوال مطلوب" })
    .trim()
    .refine(isValidSaudiPhone, "رقم جوال سعودي غير صحيح (مثال: 05XXXXXXXX)"),
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .trim()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("بريد إلكتروني غير صحيح"),
  age: z
    .union([z.coerce.number().int().min(12, "العمر غير صحيح").max(99, "العمر غير صحيح"), z.literal("")])
    .optional(),
  district: z.string().trim().optional().or(z.literal("")),
  source: z.enum(sourceValues).optional().or(z.literal("")),
  membership: z.enum(membershipValues).optional().or(z.literal("")),
  services: z.array(z.enum(serviceValues)).default([]),
  workout_time: z.enum(timeValues).optional().or(z.literal("")),
  wants_offers: z.boolean().default(true),
  // UTM / campaign (hidden fields)
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  ref: z.string().optional(),
  // Privacy consent — must be true.
  consent: z.literal(true, {
    errorMap: () => ({ message: "يجب الموافقة على سياسة الخصوصية للمتابعة" }),
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

// ── Admin: update a lead ──────────────────────────────────────
export const leadUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  age: z.coerce.number().int().min(12).max(99).optional().nullable(),
  district: z.string().trim().optional(),
  membership: z.enum(membershipValues).optional().or(z.literal("")),
  services: z.array(z.enum(serviceValues)).optional(),
  workout_time: z.enum(timeValues).optional().or(z.literal("")),
  status: z.enum(statusValues).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const statusChangeSchema = z.object({
  lead_id: z.string().uuid(),
  to_status: z.enum(statusValues),
});

export const noteSchema = z.object({
  lead_id: z.string().uuid(),
  content: z.string().trim().min(1, "الملاحظة فارغة").max(2000),
});

export const followUpSchema = z.object({
  lead_id: z.string().uuid(),
  due_at: z.string().min(1, "التاريخ مطلوب"),
  note: z.string().trim().max(500).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const campaignSchema = z.object({
  name: z.string().trim().min(2, "اسم الحملة مطلوب").max(80),
  channel: z.string().trim().max(40).optional(),
  utm_source: z.string().trim().max(60).optional(),
  utm_medium: z.string().trim().max(60).optional(),
  utm_campaign: z.string().trim().max(60).optional(),
  utm_content: z.string().trim().max(60).optional(),
});

export const settingsSchema = z.object({
  brand_name: z.string().trim().min(1).max(120),
  contact_email: z.string().trim().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  primary_color: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  accent_color: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  social_instagram: z.string().trim().url().optional().or(z.literal("")),
  social_snapchat: z.string().trim().url().optional().or(z.literal("")),
  social_tiktok: z.string().trim().url().optional().or(z.literal("")),
  privacy_policy: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
  opening_date: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور قصيرة جداً"),
});

export const userSchema = z.object({
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(roleValues),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").optional(),
});
