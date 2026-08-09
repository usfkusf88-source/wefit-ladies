import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { PollManager } from "@/components/admin/PollManager";
import { listPolls } from "@/app/actions/poll";

export const dynamic = "force-dynamic";
export const metadata = { title: "التصويتات" };

export default async function PollPage() {
  const me = await requireUser();
  if (!can(me.role, "campaigns.manage")) {
    return <div className="card p-10 text-center text-zinc-500">هذه الصفحة متاحة للمدير فقط.</div>;
  }
  const polls = await listPolls();

  return (
    <>
      <PageHeader
        title="التصويتات"
        subtitle="أنشئي تصويتات جديدة، فعّليها، وتابعي النتائج — بدون أي كود"
      />
      <PollManager polls={polls} role={me.role} />
    </>
  );
}
