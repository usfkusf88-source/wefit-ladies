import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { UsersManager } from "@/components/admin/UsersManager";
import type { Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "المستخدمون" };

export default async function UsersPage() {
  const me = await requireUser();
  if (!isAdmin(me.role)) {
    return <div className="card p-10 text-center text-zinc-500">هذه الصفحة متاحة لمدير النظام فقط.</div>;
  }
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <>
      <PageHeader title="المستخدمون والصلاحيات" subtitle="إدارة فريق العمل وأدوارهم" />
      <UsersManager profiles={(profiles ?? []) as Profile[]} meId={me.id} />
    </>
  );
}
