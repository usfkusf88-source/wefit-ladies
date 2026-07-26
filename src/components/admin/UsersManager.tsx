"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, ShieldCheck, Power } from "lucide-react";
import type { Profile } from "@/lib/database.types";
import { ROLES, labelOf } from "@/lib/constants";
import { initials, formatDate } from "@/lib/utils";
import { createUser, updateUserRole, toggleUserActive } from "@/app/admin/(app)/users/actions";

export function UsersManager({ profiles, meId }: { profiles: Profile[]; meId: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          <UserPlus className="h-5 w-5" /> مستخدم جديد
        </button>
      </div>

      {showForm && <CreateForm onDone={() => setShowForm(false)} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-soft text-right text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">المستخدم</th>
                <th className="px-5 py-3 font-semibold">الدور</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 font-semibold">أُضيف</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-line">
              {profiles.map((p) => (
                <UserRow key={p.id} profile={p} isSelf={p.id === meId} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({ profile: p, isSelf }: { profile: Profile; isSelf: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <tr className="hover:bg-gray-soft/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-brand/10 text-xs font-bold text-pink-brand">
            {initials(p.full_name ?? p.email)}
          </div>
          <div>
            <p className="font-semibold text-ink">{p.full_name ?? "—"}</p>
            <p className="text-xs text-zinc-400" dir="ltr">{p.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <select
          defaultValue={p.role}
          disabled={pending || isSelf}
          onChange={(e) => start(async () => { await updateUserRole(p.id, e.target.value); router.refresh(); })}
          className="rounded-lg border border-gray-line bg-white px-2 py-1.5 text-sm focus:border-pink-brand focus:outline-none disabled:opacity-60"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.ar}</option>
          ))}
        </select>
      </td>
      <td className="px-5 py-3">
        <span className={p.active ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700" : "inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500"}>
          <ShieldCheck className="h-3 w-3" /> {p.active ? "نشط" : "معطّل"}
        </span>
      </td>
      <td className="px-5 py-3 text-zinc-400">{formatDate(p.created_at)}</td>
      <td className="px-5 py-3 text-left">
        {!isSelf && (
          <button
            onClick={() => start(async () => { await toggleUserActive(p.id, !p.active); router.refresh(); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-line px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-gray-soft"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
            {p.active ? "تعطيل" : "تفعيل"}
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", role: "sales_agent", password: "" });

  function submit() {
    setError(null);
    start(async () => {
      const res = await createUser(form);
      if (res.ok) {
        onDone();
        router.refresh();
      } else setError(res.error ?? "تعذّر الإنشاء");
    });
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4 text-sm font-bold text-ink">إضافة مستخدم</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">الاسم الكامل</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="field-input py-2.5" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">البريد الإلكتروني</label>
          <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field-input py-2.5 text-right" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">الدور</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="field-input py-2.5">
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.ar}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">كلمة المرور المؤقتة</label>
          <input type="text" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field-input py-2.5 text-right" placeholder="8 أحرف على الأقل" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <p className="mt-2 text-xs text-zinc-400">
        الدور المختار: <span className="font-medium text-pink-brand">{labelOf(ROLES, form.role)}</span>
      </p>
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={pending || !form.email || !form.password} className="btn-primary">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />} إنشاء المستخدم
        </button>
        <button onClick={onDone} className="rounded-full border border-gray-line px-6 py-3 text-sm font-semibold">إلغاء</button>
      </div>
    </div>
  );
}
