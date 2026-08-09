"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Power,
  Loader2,
  X,
  BarChart3,
  Trophy,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { PollWithResults } from "@/app/actions/poll";
import { createPoll, togglePoll, deletePoll } from "@/app/actions/poll";
import { cn, formatDateTime } from "@/lib/utils";

export function PollManager({ polls, role }: { polls: PollWithResults[]; role: string }) {
  void role;
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          <Plus className="h-5 w-5" /> تصويت جديد
        </button>
      </div>

      {showForm && <CreateForm onDone={() => setShowForm(false)} />}

      {polls.length === 0 && !showForm && (
        <div className="card p-12 text-center text-zinc-400">
          لا توجد تصويتات بعد — أنشئي أول تصويت 🗳️
        </div>
      )}

      <div className="space-y-5">
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} />
        ))}
      </div>
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [days, setDays] = useState(3);
  const [options, setOptions] = useState<string[]>(["", "", ""]);

  function setOpt(i: number, v: string) {
    setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));
  }
  function addOpt() {
    setOptions((o) => [...o, ""]);
  }
  function removeOpt(i: number) {
    setOptions((o) => (o.length <= 2 ? o : o.filter((_, idx) => idx !== i)));
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await createPoll({ question, options, days });
      if (res.ok) {
        onDone();
        router.refresh();
      } else setError(res.error ?? "تعذّر الإنشاء");
    });
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4 text-sm font-bold text-ink">إنشاء تصويت جديد</h3>

      <label className="mb-1.5 block text-xs font-medium text-zinc-500">السؤال</label>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="مثال: وش نوع الحصص اللي تبحثين عنها أكثر؟"
        className="field-input mb-4 py-2.5"
      />

      <label className="mb-1.5 block text-xs font-medium text-zinc-500">الخيارات</label>
      <div className="space-y-2">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 text-center text-xs text-zinc-400">{i + 1}</span>
            <input
              value={o}
              onChange={(e) => setOpt(i, e.target.value)}
              placeholder={`الخيار ${i + 1}`}
              className="field-input py-2.5"
            />
            <button
              onClick={() => removeOpt(i)}
              disabled={options.length <= 2}
              className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-gray-soft disabled:opacity-30"
              aria-label="حذف"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addOpt} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-pink-brand hover:underline">
        <Plus className="h-4 w-4" /> إضافة خيار
      </button>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500">مدة التصويت (أيام):</label>
        <input
          type="number"
          min={1}
          max={60}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-20 rounded-lg border border-gray-line px-3 py-2 text-sm focus:border-pink-brand focus:outline-none"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} نشر التصويت
        </button>
        <button onClick={onDone} className="rounded-full border border-gray-line px-6 py-3 text-sm font-semibold">
          إلغاء
        </button>
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        عند النشر، يصير هذا التصويت هو الظاهر على الموقع، ويتوقّف أي تصويت آخر تلقائياً.
      </p>
    </div>
  );
}

function PollCard({ poll }: { poll: PollWithResults }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const ended = poll.ends_at ? new Date(poll.ends_at).getTime() < Date.now() : false;
  const isLive = poll.active && !ended;
  const top = Math.max(...poll.options.map((o) => poll.counts[o.id] ?? 0), 0);

  return (
    <div className={cn("card p-6", isLive && "ring-1 ring-pink-brand/30")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{poll.question}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {isLive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> نشط الآن
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-500">
                <Clock className="h-3 w-3" /> {ended ? "منتهٍ" : "متوقّف"}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> {poll.total} صوت
            </span>
            {poll.ends_at && <span>· ينتهي {formatDateTime(poll.ends_at)}</span>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => start(async () => { await togglePoll(poll.id, !poll.active); router.refresh(); })}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-line px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-gray-soft"
          >
            <Power className="h-3.5 w-3.5" /> {poll.active ? "إيقاف" : "تفعيل"}
          </button>
          {confirming ? (
            <span className="flex items-center gap-1">
              <button
                onClick={() => start(async () => { await deletePoll(poll.id); router.refresh(); })}
                disabled={pending}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "تأكيد"}
              </button>
              <button onClick={() => setConfirming(false)} className="rounded-lg border border-gray-line px-2 py-1.5 text-xs">
                إلغاء
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50"
              aria-label="حذف"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {poll.options.map((o) => {
          const votes = poll.counts[o.id] ?? 0;
          const pct = poll.total ? Math.round((votes / poll.total) * 100) : 0;
          const isTop = poll.total > 0 && votes === top;
          return (
            <div key={o.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  {isTop && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                  {o.title}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {pct}% <span className="text-xs font-normal text-zinc-400">({votes})</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-soft">
                <div
                  className={cn("h-full rounded-full", isTop ? "bg-pink-brand" : "bg-pink-300")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
