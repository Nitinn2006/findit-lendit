"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Repeat,
  ShieldCheck,
  MessageCircle,
  Bell,
  Star,
  ArrowRight,
  Sparkles,
  PackageSearch,
  HandHeart,
  UserCheck,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: EASE_OUT },
  }),
};

const FEATURES = [
  {
    icon: PackageSearch,
    title: "Lost & Found Management",
    desc: "Report lost items, upload found items with photos, and let smart matching connect owners and finders instantly.",
  },
  {
    icon: Repeat,
    title: "Borrow & Lend System",
    desc: "Need a calculator or lab coat for 2 days? Search, request, and track borrow & return dates effortlessly.",
  },
  {
    icon: UserCheck,
    title: "Verified Student Accounts",
    desc: "Every account is tied to a college email & ID — building a trusted, secure campus community.",
  },
  {
    icon: Search,
    title: "Smart Search & Filters",
    desc: "Filter by category, department, date, and item type to find exactly what you're looking for in seconds.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Get notified instantly on new matches, accepted requests, and upcoming return reminders.",
  },
  {
    icon: MessageCircle,
    title: "Secure In-App Chat",
    desc: "Coordinate handovers and borrowing directly with other students — no need to share personal numbers.",
  },
  {
    icon: Star,
    title: "Trust & Rating System",
    desc: "Rate borrowers and lenders after every exchange to build a reliable, accountable campus community.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Oversight",
    desc: "Admins can verify reports, remove fake posts, and keep the whole platform safe and clean.",
  },
];

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Login & Verify",
    desc: "Sign in with your college email or ID. Every account is verified for a trusted community.",
  },
  {
    icon: PackageSearch,
    title: "Post Lost or Found",
    desc: 'Add item name, description, location, date & a photo. E.g. "Lost Black Calculator near BCA Block."',
  },
  {
    icon: Sparkles,
    title: "Get Matched & Notified",
    desc: "Our system automatically matches lost ↔ found reports and notifies the owner instantly.",
  },
  {
    icon: ClipboardCheck,
    title: "Verify & Collect",
    desc: "Answer a quick verification question set by the finder before collecting your item.",
  },
  {
    icon: HandHeart,
    title: "Borrow & Lend Freely",
    desc: 'Search for items like "C Programming Book for 2 days" and connect with lenders on campus.',
  },
];

export default function LandingPage({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const primaryHref = isLoggedIn ? (isAdmin ? "/dashboard/admin" : "/dashboard") : "/login";
  const primaryLabel = isLoggedIn ? "Go to Dashboard" : "Get Started Free";

  return (
    <main className="overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-900/5 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-md shadow-indigo-200">
              🎒
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
              Campus Share Hub
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-indigo-600">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-indigo-600">
              How it Works
            </a>
            <a href="#benefits" className="transition hover:text-indigo-600">
              Benefits
            </a>
          </nav>
          <Link
            href={primaryHref}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg"
          >
            {isLoggedIn ? "Dashboard" : "Login"}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate px-6 pb-24 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="animate-blob absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl [animation-delay:3s]" />
          <div className="animate-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl [animation-delay:6s]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              One Platform. Whole Campus. Zero Waste.
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="show"
              custom={1}
              variants={fadeUp}
              className="text-balance font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Lost something?{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Find it.
              </span>
              <br />
              Need something?{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Borrow it.
              </span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="show"
              custom={2}
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg text-slate-600"
            >
              Campus Share Hub replaces slow WhatsApp groups and notice boards with one
              trusted platform to report lost & found items, and borrow or lend things
              like calculators, lab coats, and books — all within your college.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href={primaryHref}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-300 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
              >
                See how it works
              </a>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="show"
              custom={4}
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-8 text-sm text-slate-500"
            >
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">100%</p>
                <p>College Verified</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">24/7</p>
                <p>Match Alerts</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">₹0</p>
                <p>To Share & Save</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="animate-float rounded-[2rem] border border-white bg-white/80 p-6 shadow-2xl shadow-indigo-200 glass">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="font-semibold text-slate-800">🔎 New Match Found</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl shadow-sm">🧮</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Black Calculator</p>
                    <p className="text-xs text-slate-500">Lost near BCA Block • Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl shadow-sm">✅</div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-800">Found by Aditi R.</p>
                    <p className="text-xs text-indigo-500">Answer verification to claim</p>
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
                Verify & Claim
              </button>
            </div>
            <div className="animate-float-slow absolute -right-8 -top-8 rounded-2xl border border-white bg-white p-4 shadow-xl [animation-delay:1s]">
              <p className="text-xs font-semibold text-slate-500">Need C Programming Book</p>
              <p className="text-sm font-bold text-indigo-600">for 2 days →</p>
            </div>
            <div className="animate-float-slow absolute -bottom-6 -left-8 flex items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl [animation-delay:2s]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-slate-700">4.9 Reliable Borrower</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            WhatsApp groups and notice boards just don&apos;t work anymore
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-slate-500"
          >
            Items get lost, messages get buried, and students end up buying things they
            could've simply borrowed. Campus Share Hub brings it all into one organized,
            trusted place.
          </motion.p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                emoji: "🆔",
                title: "Lost & Found Chaos",
                text: "ID cards, wallets, chargers and bottles vanish into never-ending group chats and never reach their owners.",
              },
              {
                emoji: "🧮",
                title: "Unnecessary Spending",
                text: "Students buy new calculators, lab coats & books instead of borrowing from someone just a floor away.",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-8 text-left"
              >
                <div className="mb-4 text-4xl">{p.emoji}</div>
                <h3 className="text-lg font-bold text-slate-800">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              How it works
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 sm:text-4xl">
              From lost to found in 5 simple steps
            </h2>
          </div>
          <div className="relative mt-16 grid gap-8 md:grid-cols-5">
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-indigo-200 via-violet-300 to-fuchsia-200 md:block" />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-slate-100">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-800">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Main Features
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything your campus needs in one hub
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="bg-slate-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                For Students
              </p>
              <h3 className="mt-3 text-2xl font-bold">Save time, money, and stress</h3>
              <ul className="mt-6 space-y-4 text-slate-300">
                {["Find lost belongings quickly", "Save money by borrowing instead of buying", "Share resources with trusted peers", "Reduce waste & build a sustainable campus"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-500 text-xs">✓</span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
                For College
              </p>
              <h3 className="mt-3 text-2xl font-bold">A smarter, greener campus</h3>
              <ul className="mt-6 space-y-4 text-slate-300">
                {["Organized digital campus system", "Better student collaboration", "Digital record keeping & accountability", "Eco-friendly sharing culture"].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-fuchsia-500 text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="animate-gradient-x mx-auto max-w-5xl rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-2xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
            Ready to make campus life easier?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-100">
            Join Campus Share Hub today — the one platform for Lost & Found and Borrowing
            & Sharing, built just for your college.
          </p>
          <Link
            href={primaryHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
        <p>🎒 Campus Share Hub — One Platform for Lost & Found + Borrowing & Sharing.</p>
      </footer>
    </main>
  );
}
