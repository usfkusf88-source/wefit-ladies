import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const me = await requireUser();
  if (!can(me.role, "settings.manage")) {
    return (
      <div className="card p-10 text-center text-zinc-500">هذه الصفحة متاحة لمدير النظام فقط.</div>
    );
  }
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="الإعدادات" subtitle="معلومات التواصل، الهوية، والروابط والسياسات" />
      <SettingsForm settings={settings} />
    </>
  );
}
