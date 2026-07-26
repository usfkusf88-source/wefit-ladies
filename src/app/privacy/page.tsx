import { getSettings } from "@/lib/settings";
import { LegalShell } from "@/components/public/LegalShell";

export const dynamic = "force-dynamic";

export const metadata = { title: "سياسة الخصوصية" };

const DEFAULT_POLICY = `نحن في WEFIT Ladies نحترم خصوصيتك. نقوم بجمع بياناتك (الاسم، رقم الجوال، والبريد الإلكتروني والتفضيلات) لغرض التواصل معك بخصوص العضويات وعروض الافتتاح فقط. لا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية دون موافقتك. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا على البريد الرسمي.`;

export default async function PrivacyPage() {
  const settings = await getSettings();
  const body = settings.privacy_policy?.trim() || DEFAULT_POLICY;
  return <LegalShell title="سياسة الخصوصية" body={body} email={settings.contact_email} />;
}
