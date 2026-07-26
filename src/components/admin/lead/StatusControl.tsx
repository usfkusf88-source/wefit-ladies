"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/Badge";
import { changeStatus } from "@/app/admin/(app)/leads/actions";
import { cn } from "@/lib/utils";

export function StatusControl({ leadId, current }: { leadId: string; current: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function set(status: string) {
    setOpen(false);
    if (status === current) return;
    start(async () => {
      await changeStatus(leadId, status);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-line bg-white px-3 py-2 text-sm hover:border-pink-brand disabled:opacity-60"
      >
        <StatusBadge status={current} />
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-line bg-white p-1.5 shadow-card">
            {LEAD_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => set(s.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-soft",
                  s.value === current && "bg-gray-soft"
                )}
              >
                <span>{s.ar}</span>
                {s.value === current && <Check className="h-4 w-4 text-pink-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
