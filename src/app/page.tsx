import { Landing } from "@/components/public/Landing";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <Landing
      utm={{
        utm_source: one(sp.utm_source),
        utm_medium: one(sp.utm_medium),
        utm_campaign: one(sp.utm_campaign),
        utm_content: one(sp.utm_content),
        ref: one(sp.ref),
      }}
    />
  );
}
