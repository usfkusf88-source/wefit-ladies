"use server";

import { headers } from "next/headers";
import { registrationSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

export type RegisterState = {
  ok: boolean;
  duplicate?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Public registration action. Runs with the service-role client because the
 * submitter is anonymous. Every write is validated + rate-limited first.
 */
export async function registerLead(
  _prev: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  // ── Rate limit by IP ──
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "anon";
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return { ok: false, message: `الرجاء المحاولة بعد ${rl.retryAfter} ثانية.` };
  }

  // ── Parse + validate ──
  const raw = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    age: formData.get("age") ? String(formData.get("age")) : "",
    district: String(formData.get("district") ?? ""),
    source: String(formData.get("source") ?? ""),
    membership: String(formData.get("membership") ?? ""),
    services: formData.getAll("services").map(String),
    workout_time: String(formData.get("workout_time") ?? ""),
    wants_offers: formData.get("wants_offers") === "no" ? false : true,
    utm_source: String(formData.get("utm_source") ?? ""),
    utm_medium: String(formData.get("utm_medium") ?? ""),
    utm_campaign: String(formData.get("utm_campaign") ?? ""),
    utm_content: String(formData.get("utm_content") ?? ""),
    ref: String(formData.get("ref") ?? ""),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "يرجى مراجعة الحقول.", fieldErrors };
  }

  const data = parsed.data;
  const phone = normalizePhone(data.phone);
  if (!phone) {
    return { ok: false, fieldErrors: { phone: "رقم جوال غير صحيح" } };
  }

  const supabase = createAdminClient();

  // ── Resolve campaign from ref slug (or utm_source) ──
  let campaignId: string | null = null;
  const campaignRef = data.ref || data.utm_campaign || data.utm_source;
  if (campaignRef) {
    const { data: camp } = await supabase
      .from("campaigns")
      .select("id, utm_source, utm_medium, utm_campaign, utm_content")
      .or(`slug.eq.${campaignRef},utm_campaign.eq.${campaignRef}`)
      .limit(1)
      .maybeSingle();
    if (camp) {
      campaignId = camp.id;
      data.utm_source ||= camp.utm_source ?? "";
      data.utm_medium ||= camp.utm_medium ?? "";
      data.utm_campaign ||= camp.utm_campaign ?? "";
      data.utm_content ||= camp.utm_content ?? "";
    }
  }

  // ── Upsert via RPC (duplicate-safe) ──
  const ageNum = data.age === "" || data.age == null ? null : Number(data.age);
  const { data: rows, error } = await supabase.rpc("upsert_lead", {
    p_full_name: data.full_name,
    p_phone: phone,
    p_phone_raw: data.phone,
    p_email: data.email || "",
    p_age: ageNum,
    p_district: data.district || "",
    p_source: data.source || (campaignId ? "qr" : "other"),
    p_membership: data.membership || "",
    p_services: data.services ?? [],
    p_workout_time: data.workout_time || "",
    p_wants_offers: data.wants_offers,
    p_consent: data.consent,
    p_campaign_id: campaignId,
    p_utm_source: data.utm_source || "",
    p_utm_medium: data.utm_medium || "",
    p_utm_campaign: data.utm_campaign || "",
    p_utm_content: data.utm_content || "",
  });

  if (error) {
    console.error("[register] rpc error:", error);
    return { ok: false, message: "حدث خطأ أثناء التسجيل. حاولي مرة أخرى." };
  }

  const result = Array.isArray(rows) ? rows[0] : rows;
  const wasDuplicate = Boolean(result?.was_duplicate);
  const leadId = result?.lead_id as string | undefined;

  await logActivity({
    action: wasDuplicate ? "lead.duplicate_attempt" : "lead.created",
    entity: "lead",
    entityId: leadId ?? null,
    meta: { source: data.source, campaign: data.utm_campaign, ip },
  });

  return { ok: true, duplicate: wasDuplicate };
}
