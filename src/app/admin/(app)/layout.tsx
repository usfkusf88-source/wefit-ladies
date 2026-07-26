import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return (
    <div className="flex min-h-screen bg-gray-soft" dir="rtl">
      <Sidebar role={profile.role} name={profile.full_name ?? ""} email={profile.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
