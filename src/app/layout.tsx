import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "WEFIT Ladies — رحلتك تبدأ من هنا",
    template: "%s | WEFIT Ladies",
  },
  description:
    "سجلي اهتمامك الآن وكوني من أوائل المشتركات في WEFIT Ladies واحصلي على أولوية معرفة عروض الافتتاح والعضويات الحصرية.",
  keywords: ["WEFIT Ladies", "نادي نسائي", "الرياض", "المهدية", "لياقة", "بيلاتس", "جيم نسائي"],
  openGraph: {
    title: "WEFIT Ladies — رحلتك تبدأ من هنا",
    description: "انضمي إلى قائمة انتظار WEFIT Ladies — نحن اللياقة.",
    type: "website",
    locale: "ar_SA",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
