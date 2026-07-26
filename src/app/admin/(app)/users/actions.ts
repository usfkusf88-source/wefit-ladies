"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { userSchema } from "@/lib/validations";

type Result = { ok: boolean; error?: string };

export async function createUser(input: unknown): Promise<Result> {
  const me = await getUser();
  if (!me || !isAdmin(me.role)) return { ok: false, error: "غير مصرّح" };

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { email, full_name, role, password } = parsed.data;
  if (!password) return { ok: false, error: "كلمة المرور مطلوبة" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });
  if (error) return { ok: false, error: error.message };

  // Ensure the profile carries the chosen role (the trigger defaults it).
  if (data.user) {
    await admin
      .from("profiles")
      .update({ role, full_name, active: true })
      .eq("id", data.user.id);
  }

  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "user.created",
    entity: "user",
    entityId: data.user?.id ?? null,
    meta: { email, role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserRole(userId: string, role: string): Promise<Result> {
  const me = await getUser();
  if (!me || !isAdmin(me.role)) return { ok: false, error: "غير مصرّح" };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: "user.role_changed",
    entity: "user",
    entityId: userId,
    meta: { role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function toggleUserActive(userId: string, active: boolean): Promise<Result> {
  const me = await getUser();
  if (!me || !isAdmin(me.role)) return { ok: false, error: "غير مصرّح" };
  if (userId === me.id) return { ok: false, error: "لا يمكنك تعطيل حسابك" };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ active }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  await logActivity({
    actorId: me.id,
    actorName: me.full_name ?? me.email,
    action: active ? "user.activated" : "user.deactivated",
    entity: "user",
    entityId: userId,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
