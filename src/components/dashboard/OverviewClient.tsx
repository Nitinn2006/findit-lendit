"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PackageSearch, HandHeart, Repeat, Bell, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import type { ClientUser } from "@/components/UserContext";
import { StarDisplay } from "@/components/ui/StarRating";

type Stats = {
  activeLost: number;
  activeFound: number;
  totalListings: number;
  pendingMatches: number;
  activeBorrows: number;
  activeLendings: number;
  unread: number;
  ratingAvg: number;
  ratingCount: number;
};

const CARDS = [
  {
    key: "activeLost" as const,
    title: "Active Lost Reports",
    icon: PackageSearch,
    color: "from-amber-500 to-orange-500",
    href: "/dashboard/lost-found?tab=lost",
  },
  {
    key: "activeFound" as const,
    title: "Active Found Reports",
    icon: PackageSearch,
    color: "from-emerald-500 to-teal-500",
    href: "/dashboard/lost-found?tab=found",
  },
  {
    key: "pendingMatches" as const,
    title: "Matches Awaiting Verification",
    icon: CheckCircle2,
    color: "from-indigo-500 to-violet-500",
    href: "/dashboard/lost-found?tab=matches",
  },
  {
    key: "totalListings" as const,
    title: "Items You're Lending",
    icon: HandHeart,
    color: "from-fuchsia-500 to-pink-500",
    href: "/dashboard/borrow?tab=mine",
  },
  {
    key: "activeBorrows" as const,
    title: "Items You're Borrowing",
    icon: Repeat,
    color: "from-sky-500 to-blue-500",
    href: "/dashboard/borrow?tab=outgoing",
  },
  {
    key: "activeLendings" as const,
    title: "Items Lent Out",
    icon: Repeat,
    color: "from-cyan-500 to-teal-500",
    href: "/dashboard/borrow?tab=incoming",
  },
];

export default function OverviewClient({ user, stats }: { user: ClientUser; stats: Stats }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl"
      >
        <p className="text-sm font-medium text-indigo-100">{user.department} • {user.collegeId}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
          Hey {user.name.split(" ")[0]}, here's what's happening on campus 👋
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
            <StarDisplay value={stats.ratingAvg} count={stats.ratingCount} />
          </div>
          {stats.unread > 0 && (
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25"
            >
              <Bell className="h-4 w-4" /> {stats.unread} unread notifications
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href={card.href}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-extrabold text-slate-900">{stats[card.key]}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{card.title}</p>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickAction
          emoji="🔎"
          title="Lost something?"
          desc="Report it now with a photo and let us find matches for you."
          href="/dashboard/lost-found?tab=lost&action=report"
          cta="Report Lost Item"
        />
        <QuickAction
          emoji="🤝"
          title="Need to borrow something?"
          desc="Browse listings from students nearby and request instantly."
          href="/dashboard/borrow?tab=browse"
          cta="Browse Items"
        />
      </div>
    </div>
  );
}

function QuickAction({ emoji, title, desc, href, cta }: { emoji: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6"
    >
      <div>
        <p className="text-2xl">{emoji}</p>
        <h3 className="mt-2 text-base font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        {cta}
      </Link>
    </motion.div>
  );
}
