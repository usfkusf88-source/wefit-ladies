"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { headers } from "next/headers";

export type LoginState = { error?: string };

export async function login(_prev: LoginState | null, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = rateLimit(`login:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!rl.ok) return { error: `محاولات كثيرة. حاول بعد ${rl.retryAfter} ثانية.` };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "البريد أو كلمة المرور غير صحيحة." };
  }

  await logActivity({
    actorId: data.user?.id,
    actorName: data.user?.email,
    action: "auth.login",
    entity: "auth",
    meta: { ip },
  });

  const redirectTo = String(formData.get("redirect") || "/admin");
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await logActivity({ actorId: user?.id, actorName: user?.email, action: "auth.logout", entity: "auth" });
  await supabase.auth.signOut();
  redirect("/admin/login");
}
