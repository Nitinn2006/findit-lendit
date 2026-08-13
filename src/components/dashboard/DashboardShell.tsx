"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PackageSearch,
  Repeat,
  MessageCircle,
  Bell,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useUser } from "@/components/UserContext";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { initials } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/lost-found", label: "Lost & Found", icon: PackageSearch },
  { href: "/dashboard/borrow", label: "Borrow & Lend", icon: Repeat },
  { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user.isAdmin
    ? [...NAV, { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck }]
    : NAV;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.info("You've been logged out.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">
        <SidebarContent nav={nav} pathname={pathname} onLogout={logout} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white lg:hidden"
            >
              <SidebarContent
                nav={nav}
                pathname={pathname}
                onLogout={logout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-lg sm:px-6">
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-slate-500 sm:block">
            Welcome back, <span className="font-semibold text-slate-800">{user.name.split(" ")[0]}</span> 👋
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 transition hover:bg-indigo-100"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                {initials(user.name)}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  pathname,
  onLogout,
  onNavigate,
}: {
  nav: { href: string; label: string; icon: typeof LayoutDashboard }[];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-md">
            🎒
          </div>
          <span className="font-[family-name:var(--font-display)] text-base font-bold text-slate-900">
            Campus Share Hub
          </span>
        </Link>
        <button onClick={onNavigate} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 left-0 w-1 rounded-full bg-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className={`h-4.5 w-4.5 h-[18px] w-[18px] transition ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log Out
        </button>
      </div>
    </>
  );
}
