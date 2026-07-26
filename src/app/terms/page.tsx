import { getSettings } from "@/lib/settings";
import { LegalShell } from "@/components/public/LegalShell";

export const dynamic = "force-dynamic";

export const metadata = { title: "الشروط والأحكام" };

const DEFAULT_TERMS = `باستخدامك لموقع WEFIT Ladies وتسجيل اهتمامك، فإنك توافقين على أن المعلومات المقدمة صحيحة، وأنه سيتم استخدامها للتواصل معك بخصوص خدمات النادي. التسجيل في قائمة الانتظار لا يُعد التزاماً بالاشتراك، والعروض والأسعار قابلة للتغيير حتى الإعلان الرسمي.`;

export default async function TermsPage() {
  const settings = await getSettings();
  const body = settings.terms?.trim() || DEFAULT_TERMS;
  return <LegalShell title="الشروط والأحكام" body={body} email={settings.contact_email} />;
}
