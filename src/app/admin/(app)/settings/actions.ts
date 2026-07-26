"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { settingsSchema } from "@/lib/validations";

export type SettingsState = { ok?: boolean; error?: string };

export async function updateSettings(_prev: SettingsState | null, formData: FormData): Promise<SettingsState> {
  const me = await getUser();
  if (!me || !can(me.role, "settings.manage")) return { error: "غير مصرّح" };

  const parsed = settingsSchema.safeParse({
    brand_name: formData.get("brand_name"),
    contact_email: formData.get("contact_email"),
    phone: formData.get("phone") ?? "",
    primary_color: formData.get("primary_color") || undefined,
    accent_color: formData.get("accent_color") || undefined,
    social_instagram: formData.get("social_instagram") ?? "",
    social_snapchat: formData.get("social_snapchat") ?? "",
    social_tiktok: formData.get("social_tiktok") ?? "",
    privacy_policy: formData.get("privacy_policy") ?? "",
    terms: formData.get("terms") ?? "",
    opening_date: formData.get("opening_date") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      brand_name: d.brand_name,
      contact_email: d.contact_email,
      phone: d.phone || null,
      primary_color: d.primary_color,
      accent_color: d.accent_color,
      social_instagram: d.social_instagram || null,
      social_snapchat: d.social_snapchat || null,
      social_tiktok: d.social_tiktok || null,
      privacy_policy: d.privacy_policy || null,
      terms: d.terms || null,
      opening_date: d.opening_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: error.message };

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "settings.updated",
    entity: "settings",
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}
