"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

export function ReportLostModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    category: ITEM_CATEGORIES[0] as string,
    description: "",
    location: "",
    dateLost: new Date().toISOString().slice(0, 10),
  });
  const [photo, setPhoto] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/lost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl: photo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit report.");
        return;
      }
      toast.success(
        data.matchesCreated > 0
          ? `Report submitted! We found ${data.matchesCreated} possible match(es) 🎉`
          : "Lost item reported. We'll notify you of any matches!",
      );
      onCreated();
      onClose();
      setForm({ itemName: "", category: ITEM_CATEGORIES[0], description: "", location: "", dateLost: new Date().toISOString().slice(0, 10) });
      setPhoto(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="📢 Report a Lost Item">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Item Name</label>
          <input required className={inputCls} placeholder="e.g. Black Scientific Calculator" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date Lost</label>
            <input required type="date" className={inputCls} value={form.dateLost} onChange={(e) => setForm({ ...form, dateLost: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Location Lost</label>
          <input required className={inputCls} placeholder="e.g. Near BCA Block" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea required rows={3} className={inputCls} placeholder="Describe the item, any identifying marks..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Photo</label>
          <ImageDropzone value={photo} onChange={setPhoto} />
        </div>
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Lost Report
        </button>
      </form>
    </Modal>
  );
}

export function ReportFoundModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    category: ITEM_CATEGORIES[0] as string,
    description: "",
    location: "",
    dateFound: new Date().toISOString().slice(0, 10),
    verificationQuestion: "",
    verificationAnswer: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/found-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl: photo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit report.");
        return;
      }
      toast.success(
        data.matchesCreated > 0
          ? `Thanks! We matched it with ${data.matchesCreated} lost report(s) 🎉`
          : "Found item reported. Thanks for helping a fellow student!",
      );
      onCreated();
      onClose();
      setForm({ itemName: "", category: ITEM_CATEGORIES[0], description: "", location: "", dateFound: new Date().toISOString().slice(0, 10), verificationQuestion: "", verificationAnswer: "" });
      setPhoto(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="🙌 Report a Found Item">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Item Name</label>
          <input required className={inputCls} placeholder="e.g. Blue Water Bottle" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date Found</label>
            <input required type="date" className={inputCls} value={form.dateFound} onChange={(e) => setForm({ ...form, dateFound: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Location Found</label>
          <input required className={inputCls} placeholder="e.g. Library, 2nd floor" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea required rows={3} className={inputCls} placeholder="Describe the item..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Photo</label>
          <ImageDropzone value={photo} onChange={setPhoto} />
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <p className="mb-3 text-xs font-semibold text-indigo-700">
            🔒 Set a verification question only the real owner would know the answer to.
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Verification Question</label>
              <input required className={inputCls} placeholder="e.g. What sticker is on the back?" value={form.verificationQuestion} onChange={(e) => setForm({ ...form, verificationQuestion: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Correct Answer</label>
              <input required className={inputCls} placeholder="e.g. A panda sticker" value={form.verificationAnswer} onChange={(e) => setForm({ ...form, verificationAnswer: e.target.value })} />
            </div>
          </div>
        </div>
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Found Report
        </button>
      </form>
    </Modal>
  );
}
