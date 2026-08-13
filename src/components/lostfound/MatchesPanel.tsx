"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldQuestion, ArrowRightLeft, Loader2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { CATEGORY_ICON } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";

type MatchRow = {
  match: { id: string; status: string; attempts: number };
  lostItem: { id: string; itemName: string; category: string; location: string; userId: string; photoUrl: string | null };
  foundItem: { id: string; itemName: string; category: string; location: string; verificationQuestion: string; userId: string; photoUrl: string | null };
  owner: { id: string; name: string };
  finder: { id: string; name: string };
  myRole: "owner" | "finder";
};

export function MatchesPanel({ refreshKey }: { refreshKey: number }) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const user = useUser();
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data.matches ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function startChat(otherUserId: string, label: string) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId, contextType: "lost", contextLabel: label }),
    });
    if (res.ok) router.push("/dashboard/chat");
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="animate-shimmer h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No matches yet"
        message="When your lost or found reports match with someone else's, they'll show up here automatically."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {matches.map((m, i) => (
        <MatchCard
          key={m.match.id}
          data={m}
          index={i}
          currentUserId={user.id}
          onVerified={load}
          onMessage={startChat}
          toast={toast}
        />
      ))}
    </div>
  );
}

function MatchCard({
  data,
  index,
  currentUserId,
  onVerified,
  onMessage,
  toast,
}: {
  data: MatchRow;
  index: number;
  currentUserId: string;
  onVerified: () => void;
  onMessage: (id: string, label: string) => void;
  toast: ReturnType<typeof useToast>;
}) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isOwner = data.lostItem.userId === currentUserId;

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${data.match.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const result = await res.json();
      if (result.verified) {
        toast.success("Verified! Ownership confirmed — arrange the pickup 🎉");
      } else if (result.rejected) {
        toast.error(result.error);
      } else {
        toast.error(result.error ?? "Incorrect answer.");
      }
      onVerified();
    } finally {
      setSubmitting(false);
    }
  }

  async function reject() {
    await fetch(`/api/matches/${data.match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    toast.info("Match dismissed.");
    onVerified();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600">
          <ArrowRightLeft className="h-3.5 w-3.5" /> Potential Match
        </span>
        <StatusBadge status={data.match.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl">{CATEGORY_ICON[data.lostItem.category] ?? "📦"}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{data.lostItem.itemName}</p>
          <p className="text-xs text-slate-400">Lost by {isOwner ? "you" : data.owner.name}</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl">{CATEGORY_ICON[data.foundItem.category] ?? "📦"}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{data.foundItem.itemName}</p>
          <p className="text-xs text-slate-400">Found by {!isOwner ? "you" : data.finder.name}</p>
        </div>
      </div>

      {data.match.status === "pending" ? (
        isOwner ? (
          <form onSubmit={verify} className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-white p-3.5">
            <p className="flex items-start gap-1.5 text-xs font-semibold text-indigo-700">
              <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0" /> {data.foundItem.verificationQuestion}
            </p>
            <input
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer..."
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-2 flex gap-2">
              <button
                disabled={submitting}
                type="submit"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Verify & Claim
              </button>
              <button type="button" onClick={reject} className="rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            {data.match.attempts > 0 && (
              <p className="mt-1.5 text-[11px] text-rose-500">{3 - data.match.attempts} attempt(s) left</p>
            )}
          </form>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-3.5 text-center text-xs text-slate-500">
            Waiting for {data.owner.name} to verify ownership with the secret question.
          </div>
        )
      ) : data.match.status === "verified" ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700">
          ✅ Ownership verified! Coordinate the handover via chat.
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500">
          This match was dismissed.
        </div>
      )}

      {data.match.status !== "rejected" && (
        <button
          onClick={() => onMessage(isOwner ? data.finder.id : data.owner.id, data.lostItem.itemName)}
          className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
        >
          💬 Message {isOwner ? data.finder.name : data.owner.name}
        </button>
      )}
    </motion.div>
  );
}
