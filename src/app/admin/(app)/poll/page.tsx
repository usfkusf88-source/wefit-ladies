import { Waves, Users, CalendarDays, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getPollResults, getPollToday } from "@/app/actions/poll";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "التصويتات" };

const OPTIONS = [
  { key: "option1" as const, title: "من ٨ إلى ١١ صباحاً", sub: "الفترة الصباحية" },
  { key: "option2" as const, title: "من ٤ إلى ٧ مساءً", sub: "بعد الظهر" },
  { key: "option3" as const, title: "من ٥ إلى ١٠ مساءً", sub: "المساء" },
];

export default async function PollPage() {
  await requireUser();
  const [results, today] = await Promise.all([getPollResults(), getPollToday()]);

  const rows = OPTIONS.map((o) => ({
    ...o,
    votes: results[o.key],
    pct: results.total ? Math.round((results[o.key] / results.total) * 100) : 0,
  }));
  const topVotes = Math.max(...rows.map((r) => r.votes), 0);

  return (
    <>
      <PageHeader
        title="نتائج التصويت"
        subtitle="الأوقات المفضلة للحصص الجماعية — تصويت الزائرات على صفحة التسجيل"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="إجمالي الأصوات" value={results.total} icon={Users} accent />
        <StatCard label="أصوات اليوم" value={today} icon={CalendarDays} />
        <StatCard
          label="الخيار الأعلى"
          value={
            results.total
              ? `${Math.max(...rows.map((r) => r.pct))}%`
              : "—"
          }
          icon={Trophy}
        />
      </div>

      <div className="mt-6 card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Waves className="h-4 w-4 text-pink-brand" />
          <h3 className="text-sm font-bold text-ink">وش أفضل وقت للحصص الجماعية؟</h3>
        </div>

        <div className="space-y-4">
          {rows.map((r) => {
            const isTop = results.total > 0 && r.votes === topVotes;
            return (
              <div key={r.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {isTop && <Trophy className="h-4 w-4 text-amber-500" />}
                    {r.title}
                    <span className="text-xs font-normal text-zinc-400">· {r.sub}</span>
                  </span>
                  <span className="font-bold text-ink">
                    {r.pct}% <span className="text-xs font-normal text-zinc-400">({r.votes})</span>
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-soft">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isTop ? "bg-pink-brand" : "bg-pink-300"
                    )}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {results.total === 0 && (
          <p className="mt-6 text-center text-sm text-zinc-400">لا توجد أصوات بعد.</p>
        )}
      </div>
    </>
  );
}
