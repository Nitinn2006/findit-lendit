"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Repeat, Inbox, Send, HandHeart } from "lucide-react";
import { ITEM_CATEGORIES, DEPARTMENTS } from "@/lib/constants";
import { ListingCard } from "@/components/borrow/ListingCard";
import { RequestRow } from "@/components/borrow/RequestRow";
import { CreateListingModal, BorrowRequestModal, RateModal } from "@/components/borrow/BorrowModals";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/ui/Toast";

type Tab = "browse" | "mine" | "outgoing" | "incoming";

type Lender = { id: string; name: string; department: string; ratingAvg: number; ratingCount: number };
type ListingRow = { listing: { id: string; itemName: string; category: string; description: string; photoUrl: string | null; availableFrom: string; availableTo: string; status: string; userId: string }; lender: Lender };
type RequestRowType = {
  request: { id: string; borrowDate: string; returnDate: string; status: string; message: string | null; listingId: string };
  listing: { id: string; itemName: string; userId: string };
  borrower: { id: string; name: string; department: string };
  lender: { id: string; name: string; department: string };
};

export default function BorrowApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useUser();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "browse");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [outgoing, setOutgoing] = useState<RequestRowType[]>([]);
  const [incoming, setIncoming] = useState<RequestRowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [borrowTarget, setBorrowTarget] = useState<{ id: string; name: string } | null>(null);
  const [rateTarget, setRateTarget] = useState<{ requestId: string; name: string } | null>(null);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "browse" || tab === "mine") {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (department) params.set("department", department);
      if (q) params.set("q", q);
      if (tab === "mine") params.set("mine", "true");
      const res = await fetch(`/api/borrow-listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } else if (tab === "outgoing") {
      const res = await fetch("/api/borrow-requests?role=outgoing");
      const data = await res.json();
      setOutgoing(data.requests ?? []);
    } else if (tab === "incoming") {
      const res = await fetch("/api/borrow-requests?role=incoming");
      const data = await res.json();
      setIncoming(data.requests ?? []);
    }
    setLoading(false);
  }, [tab, category, department, q]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/dashboard/borrow?tab=${t}`);
  }

  async function deleteListing(id: string) {
    if (!confirm("Remove this listing?")) return;
    await fetch(`/api/borrow-listings/${id}`, { method: "DELETE" });
    toast.info("Listing removed.");
    setRefreshKey((k) => k + 1);
  }

  async function messageUser(otherUserId: string, label: string) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId, contextType: "borrow", contextLabel: label }),
    });
    if (res.ok) router.push("/dashboard/chat");
  }

  async function act(requestId: string, action: string) {
    const res = await fetch(`/api/borrow-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Action failed.");
      return;
    }
    const messages: Record<string, string> = {
      accept: "Request accepted! Item is now marked as lent.",
      reject: "Request declined.",
      cancel: "Request cancelled.",
      return: "Marked as returned. Don't forget to rate each other!",
    };
    toast.success(messages[action] ?? "Done.");
    setRefreshKey((k) => k + 1);
  }

  const TABS: { key: Tab; label: string; icon: typeof Repeat }[] = [
    { key: "browse", label: "Browse", icon: Search },
    { key: "mine", label: "My Listings", icon: HandHeart },
    { key: "outgoing", label: "I'm Borrowing", icon: Send },
    { key: "incoming", label: "Requests Received", icon: Inbox },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">Borrow & Lend</h1>
          <p className="mt-1 text-sm text-slate-500">Share resources with your campus community — save money, reduce waste.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Lend an Item
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-full bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === t.key && (
              <motion.span layoutId="borrow-tab" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <t.icon className="h-4 w-4" /> {t.label}
            </span>
          </button>
        ))}
      </div>

      {(tab === "browse" || tab === "mine") && (
        <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search item name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
            <option value="">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-72 rounded-2xl" />
          ))}
        </div>
      ) : tab === "browse" ? (
        listings.length === 0 ? (
          <EmptyState icon={Repeat} title="No items available" message="No borrowable items match your filters right now. Try a different search or check back later." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {listings.map((row) => (
                <ListingCard
                  key={row.listing.id}
                  itemName={row.listing.itemName}
                  category={row.listing.category}
                  description={row.listing.description}
                  photoUrl={row.listing.photoUrl}
                  availableFrom={row.listing.availableFrom}
                  availableTo={row.listing.availableTo}
                  status={row.listing.status}
                  lender={row.lender}
                  isMine={row.listing.userId === user.id}
                  onBorrow={() => setBorrowTarget({ id: row.listing.id, name: row.listing.itemName })}
                  onMessage={() => messageUser(row.lender.id, row.listing.itemName)}
                />
              ))}
            </AnimatePresence>
          </div>
        )
      ) : tab === "mine" ? (
        listings.length === 0 ? (
          <EmptyState icon={HandHeart} title="You aren't lending anything yet" message="List an item you own so other students can borrow it when they need it." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((row) => (
              <ListingCard
                key={row.listing.id}
                itemName={row.listing.itemName}
                category={row.listing.category}
                description={row.listing.description}
                photoUrl={row.listing.photoUrl}
                availableFrom={row.listing.availableFrom}
                availableTo={row.listing.availableTo}
                status={row.listing.status}
                lender={row.lender}
                isMine
                onDelete={() => deleteListing(row.listing.id)}
              />
            ))}
          </div>
        )
      ) : tab === "outgoing" ? (
        outgoing.length === 0 ? (
          <EmptyState icon={Send} title="No borrow requests yet" message="Browse available items and send your first borrow request." />
        ) : (
          <div className="space-y-3">
            {outgoing.map((row, i) => (
              <RequestRow
                key={row.request.id}
                index={i}
                itemName={row.listing.itemName}
                borrowDate={row.request.borrowDate}
                returnDate={row.request.returnDate}
                status={row.request.status}
                message={row.request.message}
                person={row.lender}
                personRoleLabel="Lender"
                showCancel={row.request.status === "pending"}
                showReturn={row.request.status === "accepted"}
                showRate={row.request.status === "returned" && !ratedIds.has(row.request.id)}
                onCancel={() => act(row.request.id, "cancel")}
                onReturn={() => act(row.request.id, "return")}
                onRate={() => setRateTarget({ requestId: row.request.id, name: row.lender.name })}
                onMessage={() => messageUser(row.lender.id, row.listing.itemName)}
              />
            ))}
          </div>
        )
      ) : incoming.length === 0 ? (
        <EmptyState icon={Inbox} title="No incoming requests" message="When someone wants to borrow your items, their requests will appear here." />
      ) : (
        <div className="space-y-3">
          {incoming.map((row, i) => (
            <RequestRow
              key={row.request.id}
              index={i}
              itemName={row.listing.itemName}
              borrowDate={row.request.borrowDate}
              returnDate={row.request.returnDate}
              status={row.request.status}
              message={row.request.message}
              person={row.borrower}
              personRoleLabel="Borrower"
              showAccept={row.request.status === "pending"}
              showReject={row.request.status === "pending"}
              showReturn={row.request.status === "accepted"}
              showRate={row.request.status === "returned" && !ratedIds.has(row.request.id)}
              onAccept={() => act(row.request.id, "accept")}
              onReject={() => act(row.request.id, "reject")}
              onReturn={() => act(row.request.id, "return")}
              onRate={() => setRateTarget({ requestId: row.request.id, name: row.borrower.name })}
              onMessage={() => messageUser(row.borrower.id, row.listing.itemName)}
            />
          ))}
        </div>
      )}

      <CreateListingModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={() => setRefreshKey((k) => k + 1)} />
      <BorrowRequestModal
        open={!!borrowTarget}
        onClose={() => setBorrowTarget(null)}
        onCreated={() => setRefreshKey((k) => k + 1)}
        listingId={borrowTarget?.id ?? null}
        itemName={borrowTarget?.name ?? ""}
      />
      <RateModal
        open={!!rateTarget}
        onClose={() => setRateTarget(null)}
        onRated={() => {
          if (rateTarget) setRatedIds((prev) => new Set(prev).add(rateTarget.requestId));
          setRefreshKey((k) => k + 1);
        }}
        borrowRequestId={rateTarget?.requestId ?? null}
        ratedName={rateTarget?.name ?? ""}
      />
    </div>
  );
}
