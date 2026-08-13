"use client";

import { motion } from "framer-motion";
import { Calendar, MessageCircle, Check, X, PackageCheck, Star } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, daysUntil } from "@/lib/format";

type Person = { id: string; name: string; department: string };

export function RequestRow({
  index,
  itemName,
  borrowDate,
  returnDate,
  status,
  message,
  person,
  personRoleLabel,
  showAccept,
  showReject,
  showCancel,
  showReturn,
  showRate,
  onAccept,
  onReject,
  onCancel,
  onReturn,
  onRate,
  onMessage,
}: {
  index: number;
  itemName: string;
  borrowDate: string;
  returnDate: string;
  status: string;
  message?: string | null;
  person: Person;
  personRoleLabel: string;
  showAccept?: boolean;
  showReject?: boolean;
  showCancel?: boolean;
  showReturn?: boolean;
  showRate?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onReturn?: () => void;
  onRate?: () => void;
  onMessage?: () => void;
}) {
  const overdue = status === "accepted" && daysUntil(returnDate) < 0;
  const dueSoon = status === "accepted" && daysUntil(returnDate) >= 0 && daysUntil(returnDate) <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-800">{itemName}</h3>
          <StatusBadge status={status} />
          {overdue && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">OVERDUE</span>}
          {dueSoon && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">DUE SOON</span>}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {personRoleLabel}: <span className="font-semibold text-slate-700">{person.name}</span> · {person.department}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" /> {formatDate(borrowDate)} → {formatDate(returnDate)}
        </div>
        {message && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs italic text-slate-500">&quot;{message}&quot;</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {onMessage && (
          <button onClick={onMessage} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200">
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
        {showAccept && (
          <button onClick={onAccept} className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600">
            <Check className="h-3.5 w-3.5" /> Accept
          </button>
        )}
        {showReject && (
          <button onClick={onReject} className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100">
            <X className="h-3.5 w-3.5" /> Decline
          </button>
        )}
        {showCancel && (
          <button onClick={onCancel} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
        {showReturn && (
          <button onClick={onReturn} className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">
            <PackageCheck className="h-3.5 w-3.5" /> Mark Returned
          </button>
        )}
        {showRate && (
          <button onClick={onRate} className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600">
            <Star className="h-3.5 w-3.5" /> Rate
          </button>
        )}
      </div>
    </motion.div>
  );
}
