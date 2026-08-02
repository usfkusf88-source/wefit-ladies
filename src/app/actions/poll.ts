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

type Choice = "option1" | "option2" | "option3";
export type PollDetails = {
  total: number;
  today: number;
  week: number;
  perOption: Record<Choice, { total: number; today: number; week: number }>;
  daily: { label: string; count: number }[];
  recent: { choice: string; created_at: string }[];
};

const EMPTY_DETAILS: PollDetails = {
  total: 0,
  today: 0,
  week: 0,
  perOption: {
    option1: { total: 0, today: 0, week: 0 },
    option2: { total: 0, today: 0, week: 0 },
    option3: { total: 0, today: 0, week: 0 },
  },
  daily: [],
  recent: [],
};

// Rich details for the admin poll page.
export async function getPollDetails(): Promise<PollDetails> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          order: (col: string, o: { ascending: boolean }) => Promise<{
            data: { choice: string; created_at: string }[] | null;
          }>;
        };
      };
    })
      .from("poll_votes")
      .select("choice, created_at")
      .order("created_at", { ascending: false });

    const votes = (data ?? []) as { choice: string; created_at: string }[];
    const d: PollDetails = {
      ...EMPTY_DETAILS,
      perOption: {
        option1: { total: 0, today: 0, week: 0 },
        option2: { total: 0, today: 0, week: 0 },
        option3: { total: 0, today: 0, week: 0 },
      },
      daily: [],
      recent: [],
    };

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = startToday - 6 * 86_400_000;

    // Build 7-day buckets (oldest → newest).
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(startToday - i * 86_400_000);
      buckets.push({
        key: dt.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(dt),
        count: 0,
      });
    }
    const bIndex = new Map(buckets.map((b, i) => [b.key, i]));

    for (const v of votes) {
      const isChoice = v.choice === "option1" || v.choice === "option2" || v.choice === "option3";
      if (!isChoice) continue;
      const c = v.choice as Choice;
      const t = new Date(v.created_at).getTime();
      d.total++;
      d.perOption[c].total++;
      if (t >= startToday) {
        d.today++;
        d.perOption[c].today++;
      }
      if (t >= weekAgo) {
        d.week++;
        d.perOption[c].week++;
      }
      const key = new Date(v.created_at).toISOString().slice(0, 10);
      const bi = bIndex.get(key);
      if (bi !== undefined) buckets[bi].count++;
    }

    d.daily = buckets.map((b) => ({ label: b.label, count: b.count }));
    d.recent = votes.slice(0, 20);
    return d;
  } catch {
    return EMPTY_DETAILS;
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
