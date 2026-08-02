import { Waves, Users, CalendarDays, Trophy, CalendarRange, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getPollDetails } from "@/app/actions/poll";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "التصويتات" };

const OPTIONS = [
  { key: "option1" as const, title: "من ٨ إلى ١١ صباحاً", sub: "الفترة الصباحية" },
  { key: "option2" as const, title: "من ٤ إلى ٧ مساءً", sub: "بعد الظهر" },
  { key: "option3" as const, title: "من ٥ إلى ١٠ مساءً", sub: "المساء" },
];

const LABEL: Record<string, string> = {
  option1: "من ٨ إلى ١١ صباحاً",
  option2: "من ٤ إلى ٧ مساءً",
  option3: "من ٥ إلى ١٠ مساءً",
};

// Archived past poll (data was cleared from DB; final result preserved here).
const ARCHIVE_SWIM = {
  title: "أوقات السباحة المفضلة",
  total: 33,
  rows: [
    { title: "من ٨ صباحاً إلى ١٠ الليل", votes: 19, pct: 58 },
    { title: "من ٥ الفجر إلى ٧ المغرب", votes: 7, pct: 21 },
    { title: "من ٦ الصباح إلى ٨ مساءً", votes: 7, pct: 21 },
  ],
};

export default async function PollPage() {
  await requireUser();
  const d = await getPollDetails();

  const rows = OPTIONS.map((o) => ({
    ...o,
    votes: d.perOption[o.key].total,
    today: d.perOption[o.key].today,
    week: d.perOption[o.key].week,
    pct: d.total ? Math.round((d.perOption[o.key].total / d.total) * 100) : 0,
  }));
  const topVotes = Math.max(...rows.map((r) => r.votes), 0);
  const maxDaily = Math.max(...d.daily.map((x) => x.count), 1);

  return (
    <>
      <PageHeader
        title="نتائج التصويت"
        subtitle="الأوقات المفضلة للحصص الجماعية — تصويت الزائرات على صفحة التسجيل"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي الأصوات" value={d.total} icon={Users} accent />
        <StatCard label="أصوات اليوم" value={d.today} icon={CalendarDays} />
        <StatCard label="هذا الأسبوع" value={d.week} icon={CalendarRange} />
        <StatCard
          label="الخيار الأعلى"
          value={d.total ? `${Math.max(...rows.map((r) => r.pct))}%` : "—"}
          icon={Trophy}
        />
      </div>

      {/* Results per option */}
      <div className="mt-6 card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Waves className="h-4 w-4 text-pink-brand" />
          <h3 className="text-sm font-bold text-ink">وش أفضل وقت للحصص الجماعية؟</h3>
        </div>

        <div className="space-y-4">
          {rows.map((r) => {
            const isTop = d.total > 0 && r.votes === topVotes;
            return (
              <div key={r.key}>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {isTop && <Trophy className="h-4 w-4 text-amber-500" />}
                    {r.title}
                    <span className="text-xs font-normal text-zinc-400">· {r.sub}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>اليوم: {r.today}</span>
                    <span>·</span>
                    <span>الأسبوع: {r.week}</span>
                    <span className="text-sm font-bold text-ink">
                      {r.pct}% ({r.votes})
                    </span>
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-soft">
                  <div
                    className={cn("h-full rounded-full transition-all", isTop ? "bg-pink-brand" : "bg-pink-300")}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {d.total === 0 && <p className="mt-6 text-center text-sm text-zinc-400">لا توجد أصوات بعد.</p>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily last 7 days */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-bold text-ink">الأصوات — آخر ٧ أيام</h3>
          <div className="space-y-2.5">
            {d.daily.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-zinc-500">{day.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-soft">
                  <div
                    className="h-full rounded-full bg-pink-brand"
                    style={{ width: `${Math.round((day.count / maxDaily) * 100)}%` }}
                  />
                </div>
                <span className="w-6 text-left text-xs font-semibold text-ink">{day.count}</span>
              </div>
            ))}
            {d.daily.every((x) => x.count === 0) && (
              <p className="py-4 text-center text-sm text-zinc-400">لا توجد أصوات في آخر ٧ أيام</p>
            )}
          </div>
        </div>

        {/* Recent votes */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-brand" />
            <h3 className="text-sm font-bold text-ink">أحدث الأصوات</h3>
          </div>
          <ul className="divide-y divide-gray-line">
            {d.recent.map((v, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-ink">{LABEL[v.choice] ?? v.choice}</span>
                <span className="text-xs text-zinc-400">{formatDateTime(v.created_at)}</span>
              </li>
            ))}
            {d.recent.length === 0 && (
              <li className="py-4 text-center text-sm text-zinc-400">لا توجد أصوات بعد</li>
            )}
          </ul>
        </div>
      </div>

      {/* Archived poll: swimming hours */}
      <div className="mt-6 card border-dashed p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Waves className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-500">
            أرشيف: تصويت {ARCHIVE_SWIM.title}
          </h3>
          <span className="rounded-full bg-gray-soft px-2.5 py-0.5 text-xs text-zinc-500">
            منتهٍ · إجمالي {ARCHIVE_SWIM.total} صوت
          </span>
        </div>
        <div className="space-y-3">
          {ARCHIVE_SWIM.rows.map((r, i) => {
            const isTop = i === 0;
            return (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-zinc-600">
                    {isTop && <Trophy className="h-4 w-4 text-amber-500" />}
                    {r.title}
                  </span>
                  <span className="text-sm font-semibold text-zinc-600">
                    {r.pct}% <span className="text-xs font-normal text-zinc-400">({r.votes})</span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-soft">
                  <div
                    className={cn("h-full rounded-full", isTop ? "bg-zinc-500" : "bg-zinc-300")}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
