"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";

export type PollOption = { id: string; title: string; sub?: string };
export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  active: boolean;
  ends_at: string | null;
  created_at: string;
};
export type PollResults = { counts: Record<string, number>; total: number };
export type PollWithResults = Poll & PollResults;

// poll tables are not in the generated Database types → use a loose client.
function adminDb() {
  return createAdminClient() as unknown as { from: (t: string) => any };
}

function normalize(p: any): Poll {
  return {
    id: p.id,
    question: p.question,
    options: Array.isArray(p.options) ? p.options : [],
    active: !!p.active,
    ends_at: p.ends_at ?? null,
    created_at: p.created_at,
  };
}

async function tally(pollId: string): Promise<PollResults> {
  const { data } = await adminDb().from("poll_votes").select("choice").eq("poll_id", pollId);
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of (data ?? []) as { choice: string }[]) {
    counts[r.choice] = (counts[r.choice] ?? 0) + 1;
    total++;
  }
  return { counts, total };
}

// ── Public ─────────────────────────────────────────────────────
export async function getActivePoll(): Promise<Poll | null> {
  try {
    const { data } = await adminDb()
      .from("polls")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    const p = Array.isArray(data) ? data[0] : null;
    if (!p) return null;
    if (p.ends_at && new Date(p.ends_at).getTime() < Date.now()) return null;
    return normalize(p);
  } catch {
    return null;
  }
}

export async function submitVote(
  pollId: string,
  choice: string
): Promise<{ ok: boolean; results?: PollResults; error?: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = rateLimit(`vote:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!rl.ok) return { ok: false, error: "محاولات كثيرة، حاولي بعد قليل." };

  try {
    const admin = adminDb();
    const { data: poll } = await admin.from("polls").select("options,active,ends_at").eq("id", pollId).maybeSingle();
    if (!poll) return { ok: false, error: "التصويت غير متاح" };
    const opts = (Array.isArray(poll.options) ? poll.options : []) as PollOption[];
    if (!opts.some((o) => o.id === choice)) return { ok: false, error: "خيار غير صحيح" };

    await admin.from("poll_votes").insert({ poll_id: pollId, choice, voter: ip });
    const results = await tally(pollId);
    return { ok: true, results };
  } catch (err) {
    console.error("[poll] vote error:", err);
    return { ok: false, error: "تعذّر تسجيل التصويت." };
  }
}

// ── Admin ──────────────────────────────────────────────────────
export async function listPolls(): Promise<PollWithResults[]> {
  const me = await getUser();
  if (!me) return [];
  try {
    const admin = adminDb();
    const { data: polls } = await admin.from("polls").select("*").order("created_at", { ascending: false });
    const { data: votes } = await admin.from("poll_votes").select("poll_id, choice");

    const byPoll: Record<string, Record<string, number>> = {};
    const totals: Record<string, number> = {};
    for (const v of (votes ?? []) as { poll_id: string | null; choice: string }[]) {
      if (!v.poll_id) continue;
      (byPoll[v.poll_id] ??= {})[v.choice] = (byPoll[v.poll_id][v.choice] ?? 0) + 1;
      totals[v.poll_id] = (totals[v.poll_id] ?? 0) + 1;
    }

    return ((polls ?? []) as any[]).map((p) => ({
      ...normalize(p),
      counts: byPoll[p.id] ?? {},
      total: totals[p.id] ?? 0,
    }));
  } catch {
    return [];
  }
}

type Result = { ok: boolean; error?: string };

export async function createPoll(input: {
  question: string;
  options: string[];
  days: number;
}): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };

  const question = (input.question ?? "").trim();
  const opts = (input.options ?? []).map((s) => s.trim()).filter(Boolean);
  if (question.length < 2) return { ok: false, error: "السؤال مطلوب" };
  if (opts.length < 2) return { ok: false, error: "أضيفي خيارين على الأقل" };

  const days = Math.min(Math.max(Number(input.days) || 3, 1), 60);
  const options: PollOption[] = opts.map((title) => ({ id: globalThis.crypto.randomUUID(), title }));
  const ends_at = new Date(Date.now() + days * 86_400_000).toISOString();

  try {
    const admin = adminDb();
    await admin.from("polls").update({ active: false }).eq("active", true);
    const { error } = await admin.from("polls").insert({ question, options, active: true, ends_at });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/poll");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "تعذّر إنشاء التصويت" };
  }
}

export async function togglePoll(id: string, active: boolean): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };
  try {
    const admin = adminDb();
    if (active) await admin.from("polls").update({ active: false }).eq("active", true);
    const { error } = await admin.from("polls").update({ active }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/poll");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر التحديث" };
  }
}

export async function deletePoll(id: string): Promise<Result> {
  const me = await getUser();
  if (!me || !can(me.role, "campaigns.manage")) return { ok: false, error: "غير مصرّح" };
  try {
    const { error } = await adminDb().from("polls").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/poll");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر الحذف" };
  }
}
