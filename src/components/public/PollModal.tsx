"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Check, Loader2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitVote, type PollResults } from "@/app/actions/poll";

// ⏳ Poll closes at this time (Riyadh). Change this to extend/shorten.
const POLL_END = new Date("2026-08-05T23:59:59+03:00").getTime();
const STORAGE_KEY = "wf_poll_group_classes_v1";

const OPTIONS = [
  { key: "option1", title: "من ٨ إلى ١١ صباحاً", sub: "الفترة الصباحية" },
  { key: "option2", title: "من ٤ إلى ٧ مساءً", sub: "بعد الظهر" },
  { key: "option3", title: "من ٥ إلى ١٠ مساءً", sub: "المساء" },
] as const;

function remaining() {
  const diff = POLL_END - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function PollModal() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [results, setResults] = useState<PollResults | null>(null);
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);

  // Decide whether to show the poll (once per browser, before it closes).
  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done && remaining()) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Countdown ticker while open.
  useEffect(() => {
    if (!open) return;
    setLeft(remaining());
    const id = setInterval(() => setLeft(remaining()), 1000);
    return () => clearInterval(id);
  }, [open]);

  function vote() {
    if (!choice) return;
    setPending(true);
    submitVote(choice)
      .then((res) => {
        if (res.ok && res.results) {
          setResults(res.results);
          try {
            localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
        }
      })
      .finally(() => setPending(false));
  }

  const pct = (n: number) => (results && results.total ? Math.round((n / results.total) * 100) : 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-ink text-white shadow-2xl"
          >
            {/* glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-pink-brand/30 blur-3xl" />

            <div className="relative p-6 sm:p-7">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-brand text-white shadow-pink-glow">
                <Dumbbell className="h-7 w-7" />
              </div>
              <h3 className="text-center text-xl font-extrabold">صوّتي معنا 💪</h3>
              <p className="mt-1 text-center text-sm text-white/60">ودنا نأخذ رأيك.. وش أفضل وقت للحصص الجماعية؟</p>

              {/* Countdown */}
              {left && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-white/80">
                  <Timer className="h-4 w-4 text-pink-brand" />
                  <span className="text-xs">ينتهي التصويت خلال</span>
                  <span className="flex gap-1 font-mono text-sm font-bold">
                    <b className="rounded bg-white/10 px-1.5 py-0.5">{left.d}ي</b>
                    <b className="rounded bg-white/10 px-1.5 py-0.5">{String(left.h).padStart(2, "0")}س</b>
                    <b className="rounded bg-white/10 px-1.5 py-0.5">{String(left.m).padStart(2, "0")}د</b>
                    <b className="rounded bg-white/10 px-1.5 py-0.5">{String(left.s).padStart(2, "0")}ث</b>
                  </span>
                </div>
              )}

              {/* Options / Results */}
              <div className="mt-6 space-y-2.5">
                {OPTIONS.map((o) => {
                  const percentage = pct(results?.[o.key] ?? 0);
                  return (
                    <button
                      key={o.key}
                      disabled={!!results || pending}
                      onClick={() => setChoice(o.key)}
                      className={cn(
                        "relative w-full overflow-hidden rounded-2xl border p-3.5 text-right transition-all",
                        results
                          ? "cursor-default border-white/10"
                          : choice === o.key
                            ? "border-pink-brand bg-pink-brand/10"
                            : "border-white/15 hover:border-white/40"
                      )}
                    >
                      {results && (
                        <span
                          className="absolute inset-y-0 right-0 bg-pink-brand/25"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <span className="relative flex items-center justify-between">
                        <span>
                          <span className="block text-sm font-bold">{o.title}</span>
                          <span className="block text-xs text-white/50">{o.sub}</span>
                        </span>
                        {results ? (
                          <span className="text-sm font-bold text-pink-300">{percentage}%</span>
                        ) : (
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border",
                              choice === o.key ? "border-pink-brand bg-pink-brand" : "border-white/30"
                            )}
                          >
                            {choice === o.key && <Check className="h-3 w-3 text-white" />}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {results ? (
                <div className="mt-5 text-center">
                  <p className="text-sm font-semibold text-emerald-400">✅ شكراً لتصويتك!</p>
                  <p className="mt-1 text-xs text-white/50">إجمالي الأصوات: {results.total}</p>
                  <button onClick={() => setOpen(false)} className="btn-ghost mt-4 w-full">
                    إغلاق
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={vote} disabled={!choice || pending} className="btn-primary mt-5 w-full">
                    {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "أرسلي تصويتك للمتابعة"}
                  </button>
                  <p className="mt-3 text-center text-xs text-white/40">
                    صوتك يساعدنا نحدّد أنسب وقت — التصويت مطلوب لإكمال التسجيل
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
