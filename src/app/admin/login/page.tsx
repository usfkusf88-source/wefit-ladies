import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "تسجيل الدخول" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 text-white">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-pink-brand/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(115deg,transparent,transparent_22px,#E14FA0_22px,#E14FA0_23px)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl font-black tracking-tight">
            WEFIT <span className="text-pink-brand">Ladies</span>
          </span>
          <p className="mt-2 text-sm text-white/50">لوحة التحكم · إدارة العملاء المحتملين</p>
        </div>
        <div className="glass rounded-3xl p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
