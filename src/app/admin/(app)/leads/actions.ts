"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import {
  leadUpdateSchema,
  statusChangeSchema,
  noteSchema,
  followUpSchema,
} from "@/lib/validations";
import { labelOf } from "@/lib/constants";
import { LEAD_STATUSES } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

export async function changeStatus(leadId: string, toStatus: string): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "leads.status")) return { ok: false, error: "غير مصرّح" };

  const parsed = statusChangeSchema.safeParse({ lead_id: leadId, to_status: toStatus });
  if (!parsed.success) return { ok: false, error: "قيمة غير صحيحة" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: toStatus, last_contact_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  // Attribution on the auto-created history row.
  await supabase
    .from("lead_status_history")
    .update({ changed_by: me.id, changed_by_name: me.full_name ?? me.email })
    .eq("lead_id", leadId)
    .is("changed_by", null);

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "lead.status_change",
    entity: "lead",
    entityId: leadId,
    meta: { to: labelOf(LEAD_STATUSES, toStatus) },
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function addNote(leadId: string, content: string): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "notes.create")) return { ok: false, error: "غير مصرّح" };

  const parsed = noteSchema.safeParse({ lead_id: leadId, content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    content: parsed.data.content,
    author_id: me.id,
    author_name: me.full_name ?? me.email,
  });
  if (error) return { ok: false, error: error.message };

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "note.created",
    entity: "lead",
    entityId: leadId,
  });
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function addFollowUp(input: {
  leadId: string;
  dueAt: string;
  note?: string;
}): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "followups.manage")) return { ok: false, error: "غير مصرّح" };

  const parsed = followUpSchema.safeParse({
    lead_id: input.leadId,
    due_at: input.dueAt,
    note: input.note,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").insert({
    lead_id: input.leadId,
    due_at: new Date(parsed.data.due_at).toISOString(),
    note: parsed.data.note ?? null,
    assigned_to: me.id,
    created_by: me.id,
  });
  if (error) return { ok: false, error: error.message };

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "followup.created",
    entity: "lead",
    entityId: input.leadId,
  });
  revalidatePath(`/admin/leads/${input.leadId}`);
  return { ok: true };
}

export async function toggleFollowUp(id: string, leadId: string, done: boolean): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "followups.manage")) return { ok: false, error: "غير مصرّح" };
  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").update({ done }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function updateLead(leadId: string, input: unknown): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "leads.edit")) return { ok: false, error: "غير مصرّح" };

  const parsed = leadUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update(parsed.data).eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "lead.updated",
    entity: "lead",
    entityId: leadId,
  });
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function assignLead(leadId: string, userId: string | null): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "leads.assign")) return { ok: false, error: "غير مصرّح" };
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ assigned_to: userId }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "lead.assigned",
    entity: "lead",
    entityId: leadId,
    meta: { assigned_to: userId },
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function deleteLead(leadId: string): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "leads.delete")) return { ok: false, error: "غير مصرّح" };
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "lead.deleted",
    entity: "lead",
    entityId: leadId,
  });
  revalidatePath("/admin/leads");
  return { ok: true };
}
