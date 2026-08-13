"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
