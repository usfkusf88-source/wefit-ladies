import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { CampaignManager } from "@/components/admin/campaigns/CampaignManager";
import type { Campaign } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "حملات QR" };

export default async function CampaignsPage() {
  await requireUser();
  const supabase = await createClient();

  const [{ data: campaigns }, { data: leads }] = await Promise.all([
    supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("leads").select("campaign_id"),
  ]);

  // Count leads per campaign.
  const counts: Record<string, number> = {};
  for (const l of leads ?? []) {
    if (l.campaign_id) counts[l.campaign_id] = (counts[l.campaign_id] ?? 0) + 1;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <>
      <PageHeader
        title="حملات QR"
        subtitle="أنشئي رموز QR لكل قناة مع وسوم UTM تلقائية وتتبّع المصدر"
      />
      <CampaignManager
        campaigns={(campaigns ?? []) as Campaign[]}
        counts={counts}
        siteUrl={siteUrl}
      />
    </>
  );
}
