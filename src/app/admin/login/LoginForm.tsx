"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/admin";
  const notice = params.get("error");
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">البريد الإلكتروني</label>
        <input
          name="email"
          type="email"
          dir="ltr"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-pink-brand focus:outline-none focus:ring-2 focus:ring-pink-brand/30"
          placeholder="admin@wefitgymsa.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">كلمة المرور</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-pink-brand focus:outline-none focus:ring-2 focus:ring-pink-brand/30"
          placeholder="••••••••"
        />
      </div>

      {(state?.error || notice) && (
        <p className="rounded-xl bg-rose-500/15 px-4 py-2.5 text-sm text-rose-300">
          {state?.error ??
            (notice === "inactive"
              ? "الحساب غير مفعّل. تواصل مع المدير."
              : "الجلسة منتهية. يرجى تسجيل الدخول.")}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> جارٍ الدخول...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" /> تسجيل الدخول
          </>
        )}
      </button>
    </form>
  );
}
