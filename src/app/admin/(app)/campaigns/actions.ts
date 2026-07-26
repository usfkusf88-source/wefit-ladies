"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { campaignSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

type Result = { ok: boolean; error?: string };

export async function createCampaign(input: unknown): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const supabase = await createClient();
  const base = slugify(data.name) || "campaign";
  // Ensure unique slug.
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data: existing } = await supabase.from("campaigns").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${base}-${i}`;
  }

  const { error } = await supabase.from("campaigns").insert({
    name: data.name,
    slug,
    channel: data.channel ?? null,
    utm_source: data.utm_source || slug,
    utm_medium: data.utm_medium || "qr",
    utm_campaign: data.utm_campaign || "prereg",
    utm_content: data.utm_content ?? null,
    created_by: me.id,
  });
  if (error) return { ok: false, error: error.message };

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "campaign.created",
    entity: "campaign",
    meta: { name: data.name, slug },
  });
  revalidatePath("/admin/campaigns");
  return { ok: true };
}

export async function toggleCampaign(id: string, active: boolean): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/campaigns");
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "campaign.deleted",
    entity: "campaign",
    entityId: id,
  });
  revalidatePath("/admin/campaigns");
  return { ok: true };
}
