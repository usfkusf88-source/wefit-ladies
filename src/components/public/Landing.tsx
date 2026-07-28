import { Hero } from "./Hero";
import { Features } from "./Features";
import { RegistrationForm } from "./RegistrationForm";
import { ReferralBanner } from "./ReferralBanner";
import { PublicFooter } from "./PublicFooter";
import { getSettings } from "@/lib/settings";

type UTM = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
};

export async function Landing({ utm }: { utm: UTM }) {
  const settings = await getSettings();

  return (
    <main className="bg-white">
      <Hero />
      <Features />

      <section id="register" className="relative scroll-mt-8 bg-gray-soft py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
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
