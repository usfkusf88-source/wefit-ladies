import type { Lead } from "./database.types";
import {
  LEAD_SOURCES,
  MEMBERSHIPS,
  SERVICES,
  WORKOUT_TIMES,
  CONVERTED_STATUSES,
  labelOf,
} from "./constants";
import { pct } from "./utils";

export type LeadLite = Pick<
  Lead,
  | "id"
  | "status"
  | "source"
  | "membership"
  | "services"
  | "workout_time"
  | "district"
  | "created_at"
>;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function computeKpis(leads: LeadLite[]) {
  const now = new Date();
  const today = startOfDay(now).getTime();
  const weekAgo = today - 6 * 86_400_000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;
  let converted = 0;

  for (const l of leads) {
    const t = new Date(l.created_at).getTime();
    if (t >= today) todayCount++;
    if (t >= weekAgo) weekCount++;
    if (t >= monthStart) monthCount++;
    if (CONVERTED_STATUSES.includes(l.status as never)) converted++;
  }

  return {
    total: leads.length,
    today: todayCount,
    week: weekCount,
    month: monthCount,
    converted,
    conversionRate: pct(converted, leads.length),
  };
}

/** Daily new-lead counts for the last `days` days (oldest → newest). */
export function dailyGrowth(leads: LeadLite[], days = 30) {
  const buckets: { date: string; label: string; count: number }[] = [];
  const now = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    buckets.push({
      date: d.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(d),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const l of leads) {
    const key = new Date(l.created_at).toISOString().slice(0, 10);
    const i = index.get(key);
    if (i !== undefined) buckets[i].count++;
  }
  return buckets;
}

function countBy<T extends string>(
  leads: LeadLite[],
  pick: (l: LeadLite) => T | null | undefined,
  list: { value: string; ar: string; en: string }[]
) {
  const map = new Map<string, number>();
  for (const l of leads) {
    const v = pick(l);
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return list
    .map((o) => ({ name: o.ar, value: map.get(o.value) ?? 0, key: o.value }))
    .filter((r) => r.value > 0);
}

export function bySource(leads: LeadLite[]) {
  return countBy(leads, (l) => l.source, LEAD_SOURCES);
}
export function byMembership(leads: LeadLite[]) {
  return countBy(leads, (l) => l.membership, MEMBERSHIPS);
}
export function byWorkoutTime(leads: LeadLite[]) {
  return countBy(leads, (l) => l.workout_time, WORKOUT_TIMES);
}

export function byService(leads: LeadLite[]) {
  const map = new Map<string, number>();
  for (const l of leads) {
    for (const s of l.services ?? []) map.set(s, (map.get(s) ?? 0) + 1);
  }
  return SERVICES.map((o) => ({ name: o.ar, value: map.get(o.value) ?? 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function byDistrict(leads: LeadLite[], top = 8) {
  const map = new Map<string, number>();
  for (const l of leads) {
    if (!l.district) continue;
    map.set(l.district, (map.get(l.district) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

export { labelOf };
