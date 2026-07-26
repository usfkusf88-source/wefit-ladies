import Link from "next/link";
import {
  Users,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  UserCheck,
  Percent,
  ArrowLeft,
  BellRing,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { GrowthChart, BarList, DonutChart } from "@/components/admin/Charts";
import { StatusBadge } from "@/components/ui/Badge";
import {
  computeKpis,
  dailyGrowth,
  bySource,
  byMembership,
  byService,
  byWorkoutTime,
  byDistrict,
  type LeadLite,
} from "@/lib/analytics";
import { formatDate, formatDateTime, formatPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createClient();

  const [{ data: leadsData }, { data: recent }, { data: followUps }] = await Promise.all([
    supabase
      .from("leads")
      .select("id,status,source,membership,services,workout_time,district,created_at"),
    supabase
      .from("leads")
      .select("id,full_name,phone,status,source,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("follow_ups")
      .select("id,lead_id,due_at,note,done")
      .eq("done", false)
      .order("due_at", { ascending: true })
      .limit(6),
  ]);

  const leads = (leadsData ?? []) as LeadLite[];
  const kpi = computeKpis(leads);

  return (
    <>
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على أداء التسجيلات والحملات" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="إجمالي العملاء" value={kpi.total} icon={Users} accent />
        <StatCard label="اليوم" value={kpi.today} icon={CalendarDays} />
        <StatCard label="هذا الأسبوع" value={kpi.week} icon={CalendarRange} />
        <StatCard label="هذا الشهر" value={kpi.month} icon={TrendingUp} />
        <StatCard label="أعضاء محوّلات" value={kpi.converted} icon={UserCheck} />
        <StatCard label="نسبة التحويل" value={`${kpi.conversionRate}%`} icon={Percent} />
      </div>

      <div className="mt-6">
        <GrowthChart data={dailyGrowth(leads, 30)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DonutChart title="مصادر العملاء" data={bySource(leads)} />
        <DonutChart title="العضويات المفضلة" data={byMembership(leads)} />
        <BarList title="الخدمات الأكثر اهتماماً" data={byService(leads)} />
        <BarList title="توزيع الأحياء" data={byDistrict(leads)} />
        <DonutChart title="أوقات التمرين المفضلة" data={byWorkoutTime(leads)} />

        {/* Upcoming follow-ups */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-pink-brand" />
            <h3 className="text-sm font-bold text-ink">متابعات قادمة</h3>
          </div>
          {followUps && followUps.length > 0 ? (
            <ul className="divide-y divide-gray-line">
              {followUps.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/admin/leads/${f.lead_id}`} className="font-medium text-ink hover:text-pink-brand">
                    {f.note || "متابعة عميلة"}
                  </Link>
                  <span className="text-xs text-zinc-400">{formatDateTime(f.due_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">لا توجد متابعات مجدولة</div>
          )}
        </div>
      </div>

      {/* Recent registrations */}
      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-line px-5 py-4">
          <h3 className="text-sm font-bold text-ink">أحدث التسجيلات</h3>
          <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-pink-brand hover:underline">
            عرض الكل <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-soft text-right text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">الاسم</th>
                <th className="px-5 py-3 font-semibold">الجوال</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-line">
              {(recent ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-gray-soft/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${r.id}`} className="font-medium text-ink hover:text-pink-brand">
                      {r.full_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500" dir="ltr">
                    {formatPhone(r.phone)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{formatDate(r.created_at)}</td>
                </tr>
              ))}
              {(!recent || recent.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-zinc-400">
                    لا توجد تسجيلات بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
