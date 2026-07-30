import { Hero } from "./Hero";
import { Features } from "./Features";
import { RegistrationForm } from "./RegistrationForm";
import { ReferralBanner } from "./ReferralBanner";
import { PollModal } from "./PollModal";
import { PublicFooter } from "./PublicFooter";
import { getSettings, getLeadCount } from "@/lib/settings";

type UTM = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
};

export async function Landing({ utm }: { utm: UTM }) {
  const [settings, leadCount] = await Promise.all([getSettings(), getLeadCount()]);
  // Round down to a clean number for social proof (only show once meaningful).
  const joined = leadCount >= 25 ? Math.floor(leadCount / 25) * 25 : 0;

  return (
    <main className="bg-white">
      <PollModal />
      <Hero />
      <Features />

      <section id="register" className="relative scroll-mt-8 bg-gray-soft py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {joined > 0 && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-brand/10 px-4 py-1.5 text-sm font-bold text-pink-brand">
                🔥 انضمّت أكثر من {joined} سيدة إلى قائمة الانتظار
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">سجّلي اهتمامك</h2>
            <p className="mt-3 text-zinc-500">
              دقيقة واحدة تكفي — املئي بياناتك وكوني من أوائل المشتركات.
            </p>
          </div>
          <ReferralBanner />
          <RegistrationForm utm={utm} contactEmail={settings.contact_email} />
        </div>
      </section>

      <PublicFooter settings={settings} />
    </main>
  );
}
