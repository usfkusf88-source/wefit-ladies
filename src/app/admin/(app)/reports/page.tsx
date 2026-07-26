import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReportsView } from "@/components/admin/ReportsView";
import type { Lead, Campaign, Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "التقارير" };

export default async function ReportsPage() {
  const me = await requireUser();
  if (!can(me.role, "reports.view")) {
    return <div className="card p-10 text-center text-zinc-500">غير مصرّح بعرض التقارير.</div>;
  }
  const supabase = await createClient();
  const [{ data: leads }, { data: campaigns }, { data: profiles }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("*"),
    supabase.from("profiles").select("*"),
  ]);

  return (
    <>
      <PageHeader title="التقارير" subtitle="تقارير الحملات، التحويل، وأداء الموظفات — قابلة للتصدير" />
      <ReportsView
        leads={(leads ?? []) as Lead[]}
        campaigns={(campaigns ?? []) as Campaign[]}
        profiles={(profiles ?? []) as Profile[]}
        canExport={can(me.role, "reports.export")}
      />
    </>
  );
}
