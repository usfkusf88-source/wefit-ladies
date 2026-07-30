"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Settings,
  ScrollText,
  UserCog,
  Waves,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { can, type Permission } from "@/lib/permissions";
import { labelOf, ROLES } from "@/lib/constants";
import { logout } from "@/app/admin/login/actions";

type NavItem = { href: string; label: string; icon: React.ElementType; perm: Permission };

const NAV: NavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, perm: "dashboard.view" },
  { href: "/admin/leads", label: "العملاء المحتملون", icon: Users, perm: "dashboard.view" },
  { href: "/admin/campaigns", label: "حملات QR", icon: QrCode, perm: "campaigns.manage" },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3, perm: "reports.view" },
  { href: "/admin/poll", label: "تصويتات السباحة", icon: Waves, perm: "dashboard.view" },
  { href: "/admin/activity", label: "سجل النشاط", icon: ScrollText, perm: "activity.view" },
  { href: "/admin/users", label: "المستخدمون", icon: UserCog, perm: "users.manage" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, perm: "settings.manage" },
];

export function Sidebar({
  role,
  name,
  email,
}: {
  role: string;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => can(role, n.perm));

  const NavList = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              active ? "bg-pink-brand text-white shadow-pink-glow" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Profile = (
    <div className="border-t border-white/10 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-brand/20 text-sm font-bold text-pink-brand">
          {initials(name || email)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name || "مستخدم"}</p>
          <p className="truncate text-xs text-white/40">{labelOf(ROLES, role)}</p>
        </div>
      </div>
      <form action={logout}>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> تسجيل الخروج
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-line bg-white px-4 py-3 lg:hidden">
        <span className="font-black">
          WEFIT <span className="text-pink-brand">Ladies</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="القائمة" className="rounded-lg p-2 hover:bg-gray-soft">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-ink lg:flex">
        <div className="p-6">
          <span className="text-xl font-black tracking-tight text-white">
            WEFIT <span className="text-pink-brand">Ladies</span>
          </span>
        </div>
        {NavList}
        {Profile}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col bg-ink">
            <div className="flex items-center justify-between p-6">
              <span className="text-xl font-black text-white">
                WEFIT <span className="text-pink-brand">Ladies</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="rounded-lg p-1 text-white/70">
                <X className="h-6 w-6" />
              </button>
            </div>
            {NavList}
            {Profile}
          </div>
        </div>
      )}
    </>
  );
}
