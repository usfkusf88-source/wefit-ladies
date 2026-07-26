import { Instagram, Music2, Ghost, Mail, MapPin } from "lucide-react";
import type { Settings } from "@/lib/database.types";

export function PublicFooter({ settings }: { settings: Settings }) {
  const socials = [
    { href: settings.social_instagram, icon: Instagram, label: "Instagram" },
    { href: settings.social_snapchat, icon: Ghost, label: "Snapchat" },
    { href: settings.social_tiktok, icon: Music2, label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="text-2xl font-black tracking-tight">
            WEFIT <span className="text-pink-brand">Ladies</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pink-brand" /> المهدية — الرياض
            </span>
            <a
              href={`mailto:${settings.contact_email}`}
              className="inline-flex items-center gap-2 hover:text-white"
              dir="ltr"
            >
              <Mail className="h-4 w-4 text-pink-brand" /> {settings.contact_email}
            </a>
          </div>
          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-pink-brand hover:text-pink-brand"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} WEFIT Ladies — نحن اللياقة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
