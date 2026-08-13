"use client";

import { motion } from "framer-motion";
import { Calendar, MessageCircle, Trash2, HandHeart } from "lucide-react";
import { CATEGORY_ICON } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/Badge";
import { StarDisplay } from "@/components/ui/StarRating";
import { formatDate } from "@/lib/format";

type Lender = { id: string; name: string; department: string; ratingAvg: number; ratingCount: number };

export function ListingCard({
  itemName,
  category,
  description,
  photoUrl,
  availableFrom,
  availableTo,
  status,
  lender,
  isMine,
  onBorrow,
  onDelete,
  onMessage,
}: {
  itemName: string;
  category: string;
  description: string;
  photoUrl: string | null;
  availableFrom: string;
  availableTo: string;
  status: string;
  lender: Lender;
  isMine: boolean;
  onBorrow?: () => void;
  onDelete?: () => void;
  onMessage?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={itemName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl">{CATEGORY_ICON[category] ?? "📦"}</div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800">{itemName}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{category}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 shrink-0" /> Available {formatDate(availableFrom)} – {formatDate(availableTo)}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">{isMine ? "You" : lender.name}</p>
            <StarDisplay value={lender.ratingAvg} count={lender.ratingCount} />
          </div>
          <div className="flex items-center gap-2">
            {isMine ? (
              onDelete && (
                <button onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )
            ) : (
              <>
                {onMessage && (
                  <button onClick={onMessage} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                )}
                {onBorrow && status === "available" && (
                  <button onClick={onBorrow} className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                    <HandHeart className="h-3.5 w-3.5" /> Request
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
