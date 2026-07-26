"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import type { LeadNote } from "@/lib/database.types";
import { addNote } from "@/app/admin/(app)/leads/actions";
import { formatDateTime, initials } from "@/lib/utils";

export function NotesPanel({ leadId, notes }: { leadId: string; notes: LeadNote[] }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    if (!value.trim()) return;
    setError(null);
    start(async () => {
      const res = await addNote(leadId, value);
      if (res.ok) {
        setValue("");
        router.refresh();
      } else {
        setError(res.error ?? "تعذّر الحفظ");
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-pink-brand" />
        <h3 className="text-sm font-bold text-ink">الملاحظات</h3>
        <span className="rounded-full bg-gray-soft px-2 py-0.5 text-xs text-zinc-500">{notes.length}</span>
      </div>

      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder="أضيفي ملاحظة..."
          className="field-input resize-none py-2.5"
        />
        <button onClick={submit} disabled={pending || !value.trim()} className="btn-primary shrink-0 self-end px-4 py-2.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      <ul className="mt-5 space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-brand/10 text-xs font-bold text-pink-brand">
              {initials(n.author_name ?? "؟")}
            </div>
            <div className="min-w-0 flex-1 rounded-xl bg-gray-soft p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink">{n.author_name ?? "مستخدم"}</span>
                <span className="text-xs text-zinc-400">{formatDateTime(n.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-sm text-zinc-600">{n.content}</p>
            </div>
          </li>
        ))}
        {notes.length === 0 && <li className="py-4 text-center text-sm text-zinc-400">لا توجد ملاحظات بعد</li>}
      </ul>
    </div>
  );
}
