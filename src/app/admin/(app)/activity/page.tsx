import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLog } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "سجل النشاط" };

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "تسجيل دخول",
  "auth.logout": "تسجيل خروج",
  "lead.created": "تسجيل عميلة جديدة",
  "lead.duplicate_attempt": "محاولة تسجيل مكرر",
  "lead.updated": "تعديل عميلة",
  "lead.deleted": "حذف عميلة",
  "lead.status_change": "تغيير حالة",
  "lead.assigned": "إسناد عميلة",
  "note.created": "إضافة ملاحظة",
  "followup.created": "جدولة متابعة",
  "campaign.created": "إنشاء حملة",
  "campaign.deleted": "حذف حملة",
  "settings.updated": "تحديث الإعدادات",
  "user.created": "إضافة مستخدم",
  "user.role_changed": "تغيير دور",
  "user.activated": "تفعيل مستخدم",
  "user.deactivated": "تعطيل مستخدم",
};

function actionLabel(a: string) {
  return ACTION_LABELS[a] ?? a;
}

export default async function ActivityPage() {
  const me = await requireUser();
  if (!can(me.role, "activity.view")) {
    return <div className="card p-10 text-center text-zinc-500">غير مصرّح بعرض سجل النشاط.</div>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  const logs = (data ?? []) as ActivityLog[];

  return (
    <>
      <PageHeader title="سجل النشاط" subtitle="تتبّع كل الإجراءات — دخول، تعديل، حذف، إسناد، وتصدير" />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-soft text-right text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">المستخدم</th>
                <th className="px-5 py-3 font-semibold">الإجراء</th>
                <th className="px-5 py-3 font-semibold">العنصر</th>
                <th className="px-5 py-3 font-semibold">الوقت</th>
                <th className="px-5 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-line">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-soft/50">
                  <td className="px-5 py-3 font-medium text-ink">{log.actor_name ?? "النظام"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-pink-brand/10 px-2.5 py-0.5 text-xs font-medium text-pink-brand">
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{log.entity ?? "—"}</td>
                  <td className="px-5 py-3 text-zinc-400">{formatDateTime(log.created_at)}</td>
                  <td className="px-5 py-3 text-zinc-400" dir="ltr">{log.ip_address ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-zinc-400">لا يوجد نشاط مسجّل بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
