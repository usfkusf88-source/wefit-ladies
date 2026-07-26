"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Copy, FileDown, Trash2, UserCog, Check, Loader2 } from "lucide-react";
import type { Lead, Profile } from "@/lib/database.types";
import { assignLead, deleteLead } from "@/app/admin/(app)/leads/actions";
import { can } from "@/lib/permissions";

export function LeadToolbar({
  lead,
  profiles,
  role,
}: {
  lead: Lead;
  profiles: Profile[];
  role: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const localPhone = lead.phone.startsWith("966") ? "0" + lead.phone.slice(3) : lead.phone;

  function copyNumber() {
    navigator.clipboard.writeText(localPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function reassign(userId: string) {
    start(async () => {
      await assignLead(lead.id, userId || null);
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteLead(lead.id);
      if (res.ok) router.push("/admin/leads");
    });
  }

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">إجراءات</h3>

      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${localPhone}`} className="btn-dark py-2.5">
          <Phone className="h-4 w-4" /> اتصال
        </a>
        {lead.email ? (
          <a href={`mailto:${lead.email}`} className="btn-dark py-2.5">
            <Mail className="h-4 w-4" /> بريد
          </a>
        ) : (
          <button disabled className="btn-dark py-2.5 opacity-40">
            <Mail className="h-4 w-4" /> بريد
          </button>
        )}
        <button onClick={copyNumber} className="btn-dark py-2.5">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} نسخ الرقم
        </button>
        <button onClick={() => window.print()} className="btn-dark py-2.5">
          <FileDown className="h-4 w-4" /> PDF
        </button>
      </div>

      {can(role, "leads.assign") && (
        <div className="mt-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <UserCog className="h-3.5 w-3.5" /> المسؤولة
          </label>
          <select
            defaultValue={lead.assigned_to ?? ""}
            onChange={(e) => reassign(e.target.value)}
            disabled={pending}
            className="field-input py-2.5"
          >
            <option value="">غير مُسندة</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name ?? p.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {can(role, "leads.delete") && (
        <div className="mt-4 border-t border-gray-line pt-4 no-print">
          {confirming ? (
            <div className="space-y-2">
              <p className="text-sm text-rose-600">تأكيد حذف هذه العميلة نهائياً؟</p>
              <div className="flex gap-2">
                <button onClick={remove} disabled={pending} className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white">
                  {pending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "نعم، احذفي"}
                </button>
                <button onClick={() => setConfirming(false)} className="flex-1 rounded-xl border border-gray-line py-2 text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" /> حذف العميلة
            </button>
          )}
        </div>
      )}
    </div>
  );
}
