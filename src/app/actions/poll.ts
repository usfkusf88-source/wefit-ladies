"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const CHOICES = ["option1", "option2", "option3"] as const;
export type PollResults = { option1: number; option2: number; option3: number; total: number };

const EMPTY: PollResults = { option1: 0, option2: 0, option3: 0, total: 0 };

async function tally(): Promise<PollResults> {
  const admin = createAdminClient();
  // poll_votes is not in the generated Database types; cast to bypass typing.
  const { data } = await (admin as unknown as {
    from: (t: string) => { select: (c: string) => Promise<{ data: { choice: string }[] | null }> };
  }).from("poll_votes").select("choice");

  const r: PollResults = { ...EMPTY };
  for (const row of data ?? []) {
    if (row.choice === "option1" || row.choice === "option2" || row.choice === "option3") {
      r[row.choice] += 1;
      r.total += 1;
    }
  }
  return r;
}

export async function submitVote(
  choice: string
): Promise<{ ok: boolean; results?: PollResults; error?: string }> {
  if (!CHOICES.includes(choice as (typeof CHOICES)[number])) {
    return { ok: false, error: "خيار غير صحيح" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = rateLimit(`vote:${ip}`, { limit: 6, windowMs: 60_000 });
  if (!rl.ok) return { ok: false, error: "محاولات كثيرة، حاولي بعد قليل." };

  try {
    const admin = createAdminClient();
    await (admin as unknown as {
      from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<unknown> };
    }).from("poll_votes").insert({ choice, voter: ip });

    const results = await tally();
    return { ok: true, results };
  } catch (err) {
    console.error("[poll] vote error:", err);
    return { ok: false, error: "تعذّر تسجيل التصويت." };
  }
}

export async function getPollResults(): Promise<PollResults> {
  try {
    return await tally();
  } catch {
    return { ...EMPTY };
  }
}

// Today's vote count (for the admin page).
export async function getPollToday(): Promise<number> {
  try {
    const admin = createAdminClient();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { count } = await (admin as unknown as {
      from: (t: string) => {
        select: (c: string, o: { count: "exact"; head: true }) => {
          gte: (col: string, v: string) => Promise<{ count: number | null }>;
        };
      };
    })
      .from("poll_votes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString());
    return count ?? 0;
  } catch {
    return 0;
  }
}
