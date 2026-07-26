"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, CheckCircle2, Circle } from "lucide-react";
import type { FollowUp } from "@/lib/database.types";
import { addFollowUp, toggleFollowUp } from "@/app/admin/(app)/leads/actions";
import { formatDateTime, cn } from "@/lib/utils";

export function FollowUpsPanel({ leadId, followUps }: { leadId: string; followUps: FollowUp[] }) {
  const [dueAt, setDueAt] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    if (!dueAt) return;
    start(async () => {
      await addFollowUp({ leadId, dueAt, note });
      setDueAt("");
      setNote("");
      router.refresh();
    });
  }

  function toggle(f: FollowUp) {
    start(async () => {
      await toggleFollowUp(f.id, leadId, !f.done);
      router.refresh();
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarPlus className="h-4 w-4 text-pink-brand" />
        <h3 className="text-sm font-bold text-ink">المتابعات</h3>
      </div>

      <div className="space-y-2">
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="field-input py-2.5"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة المتابعة (اختياري)"
          className="field-input py-2.5"
        />
        <button onClick={submit} disabled={pending || !dueAt} className="btn-dark w-full py-2.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          جدولة متابعة
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {followUps.map((f) => (
          <li
            key={f.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3",
              f.done ? "border-gray-line bg-gray-soft/50 opacity-60" : "border-pink-200 bg-pink-50/50"
            )}
          >
            <button onClick={() => toggle(f)} className="mt-0.5 text-pink-brand" aria-label="تبديل">
              {f.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", f.done && "line-through")}>{f.note || "متابعة"}</p>
              <p className="text-xs text-zinc-400">{formatDateTime(f.due_at)}</p>
            </div>
          </li>
        ))}
        {followUps.length === 0 && <li className="py-3 text-center text-sm text-zinc-400">لا توجد متابعات</li>}
      </ul>
    </div>
  );
}
