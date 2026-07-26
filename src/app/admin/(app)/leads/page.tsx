import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { LeadsTable } from "@/components/admin/LeadsTable";
import type { Lead, Campaign, Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء المحتملون" };

export default async function LeadsPage() {
  const me = await requireUser();
  const supabase = await createClient();

  const [{ data: leads }, { data: campaigns }, { data: profiles }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("*").order("name"),
    supabase.from("profiles").select("*").eq("active", true),
  ]);

  return (
    <>
      <PageHeader
        title="العملاء المحتملون"
        subtitle={`${leads?.length ?? 0} سجلاً — بحث، فلترة، وتصدير`}
      />
      <LeadsTable
        leads={(leads ?? []) as Lead[]}
        campaigns={(campaigns ?? []) as Campaign[]}
        profiles={(profiles ?? []) as Profile[]}
        role={me.role}
      />
    </>
  );
}
