"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";
import { StarInput } from "@/components/ui/StarRating";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

export function CreateListingModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    category: ITEM_CATEGORIES[0] as string,
    description: "",
    availableFrom: new Date().toISOString().slice(0, 10),
    availableTo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });
  const [photo, setPhoto] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/borrow-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl: photo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create listing.");
        return;
      }
      toast.success("Your item is now listed for borrowing! 🎉");
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="🤝 Lend an Item">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Item Name</label>
          <input required className={inputCls} placeholder="e.g. C Programming Book" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea required rows={3} className={inputCls} placeholder="Condition, edition, notes..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Available From</label>
            <input required type="date" className={inputCls} value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Available To</label>
            <input required type="date" className={inputCls} value={form.availableTo} onChange={(e) => setForm({ ...form, availableTo: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Photo</label>
          <ImageDropzone value={photo} onChange={setPhoto} />
        </div>
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          List Item for Borrowing
        </button>
      </form>
    </Modal>
  );
}

export function BorrowRequestModal({
  open,
  onClose,
  onCreated,
  listingId,
  itemName,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  listingId: string | null;
  itemName: string;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    borrowDate: new Date().toISOString().slice(0, 10),
    returnDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/borrow-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not send request.");
        return;
      }
      toast.success("Borrow request sent! You'll be notified once it's accepted.");
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Request to Borrow "${itemName}"`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Borrow Date</label>
            <input required type="date" className={inputCls} value={form.borrowDate} onChange={(e) => setForm({ ...form, borrowDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Return Date</label>
            <input required type="date" className={inputCls} value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Message (optional)</label>
          <textarea rows={3} className={inputCls} placeholder="e.g. Need it for 2 days for my lab exam." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Borrow Request
        </button>
      </form>
    </Modal>
  );
}

export function RateModal({
  open,
  onClose,
  onRated,
  borrowRequestId,
  ratedName,
}: {
  open: boolean;
  onClose: () => void;
  onRated: () => void;
  borrowRequestId: string | null;
  ratedName: string;
}) {
  const toast = useToast();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrowRequestId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowRequestId, stars, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit rating.");
        return;
      }
      toast.success("Thanks for rating! This helps build campus trust ⭐");
      onRated();
      onClose();
      setStars(5);
      setComment("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Rate ${ratedName}`} maxWidth="max-w-sm">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex justify-center">
          <StarInput value={stars} onChange={setStars} />
        </div>
        <div>
          <label className={labelCls}>Comment (optional)</label>
          <textarea rows={3} className={inputCls} placeholder="How was the experience?" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Rating
        </button>
      </form>
    </Modal>
  );
}
