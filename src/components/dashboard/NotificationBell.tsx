"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/lib/format";

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications ?? []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.isRead).length;

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="animate-pulse-ring absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-800">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  You&apos;re all caught up 🎉
                </p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "/dashboard"}
                    onClick={() => {
                      if (!n.isRead) markOneRead(n.id);
                      setOpen(false);
                    }}
                    className={`block border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50 ${
                      !n.isRead ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                      <div className={!n.isRead ? "" : "pl-4"}>
                        <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
