"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, PackageSearch, ArrowRightLeft } from "lucide-react";
import { ITEM_CATEGORIES, DEPARTMENTS } from "@/lib/constants";
import { ItemCard } from "@/components/lostfound/ItemCard";
import { ReportLostModal, ReportFoundModal } from "@/components/lostfound/ReportModals";
import { MatchesPanel } from "@/components/lostfound/MatchesPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/ui/Toast";

type Tab = "lost" | "found" | "mine" | "matches";

type Reporter = { id: string; name: string; department: string; ratingAvg: number; ratingCount: number };
type LostRow = { item: { id: string; itemName: string; category: string; description: string; location: string; dateLost: string; photoUrl: string | null; status: string; userId: string }; reporter: Reporter };
type FoundRow = { item: { id: string; itemName: string; category: string; description: string; location: string; dateFound: string; photoUrl: string | null; status: string; userId: string }; reporter: Reporter };

export default function LostFoundApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useUser();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "lost");
  const [lostItems, setLostItems] = useState<LostRow[]>([]);
  const [foundItems, setFoundItems] = useState<FoundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [showLostModal, setShowLostModal] = useState(searchParams.get("action") === "report" && tab === "lost");
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (department) params.set("department", department);
    if (q) params.set("q", q);
    if (tab === "mine") params.set("mine", "true");

    if (tab === "matches") {
      setLoading(false);
      return;
    }

    if (tab === "mine") {
      const [lostRes, foundRes] = await Promise.all([
        fetch(`/api/lost-items?${params.toString()}`),
        fetch(`/api/found-items?${params.toString()}`),
      ]);
      const [lostData, foundData] = await Promise.all([lostRes.json(), foundRes.json()]);
      setLostItems(lostData.items ?? []);
      setFoundItems(foundData.items ?? []);
    } else if (tab === "lost") {
      const res = await fetch(`/api/lost-items?${params.toString()}`);
      const data = await res.json();
      setLostItems(data.items ?? []);
    } else if (tab === "found") {
      const res = await fetch(`/api/found-items?${params.toString()}`);
      const data = await res.json();
      setFoundItems(data.items ?? []);
    }
    setLoading(false);
  }, [tab, category, department, q]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/dashboard/lost-found?tab=${t}`);
  }

  async function deleteLost(id: string) {
    if (!confirm("Delete this lost report?")) return;
    await fetch(`/api/lost-items/${id}`, { method: "DELETE" });
    toast.info("Lost report removed.");
    setRefreshKey((k) => k + 1);
  }

  async function deleteFound(id: string) {
    if (!confirm("Delete this found report?")) return;
    await fetch(`/api/found-items/${id}`, { method: "DELETE" });
    toast.info("Found report removed.");
    setRefreshKey((k) => k + 1);
  }

  async function messageUser(otherUserId: string, label: string, contextType: "lost" | "found") {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId, contextType, contextLabel: label }),
    });
    if (res.ok) router.push("/dashboard/chat");
  }

  const TABS: { key: Tab; label: string; icon: typeof PackageSearch }[] = [
    { key: "lost", label: "Lost Items", icon: PackageSearch },
    { key: "found", label: "Found Items", icon: PackageSearch },
    { key: "mine", label: "My Reports", icon: PackageSearch },
    { key: "matches", label: "Matches", icon: ArrowRightLeft },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">Lost & Found</h1>
          <p className="mt-1 text-sm text-slate-500">Report items, browse the campus feed, and verify matches securely.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLostModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" /> Report Lost
          </button>
          <button
            onClick={() => setShowFoundModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" /> Report Found
          </button>
        </div>
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
              <motion.span layoutId="lf-tab" className="absolute inset-0 rounded-full bg-slate-900" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <t.icon className="h-4 w-4" /> {t.label}
            </span>
          </button>
        ))}
      </div>

      {tab !== "matches" && tab !== "mine" && (
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
      ) : tab === "matches" ? (
        <MatchesPanel refreshKey={refreshKey} />
      ) : tab === "mine" ? (
        <div className="space-y-8">
          <Section title="My Lost Reports">
            <Grid empty={lostItems.length === 0} emptyMsg="You haven't reported any lost items yet.">
              {lostItems.map((row) => (
                <ItemCard
                  key={row.item.id}
                  kind="lost"
                  itemName={row.item.itemName}
                  category={row.item.category}
                  description={row.item.description}
                  location={row.item.location}
                  date={row.item.dateLost}
                  photoUrl={row.item.photoUrl}
                  status={row.item.status}
                  reporter={row.reporter}
                  isMine
                  onDelete={() => deleteLost(row.item.id)}
                />
              ))}
            </Grid>
          </Section>
          <Section title="My Found Reports">
            <Grid empty={foundItems.length === 0} emptyMsg="You haven't reported any found items yet.">
              {foundItems.map((row) => (
                <ItemCard
                  key={row.item.id}
                  kind="found"
                  itemName={row.item.itemName}
                  category={row.item.category}
                  description={row.item.description}
                  location={row.item.location}
                  date={row.item.dateFound}
                  photoUrl={row.item.photoUrl}
                  status={row.item.status}
                  reporter={row.reporter}
                  isMine
                  onDelete={() => deleteFound(row.item.id)}
                />
              ))}
            </Grid>
          </Section>
        </div>
      ) : tab === "lost" ? (
        <Grid empty={lostItems.length === 0} emptyMsg="No lost items reported matching your filters.">
          <AnimatePresence>
            {lostItems.map((row) => (
              <ItemCard
                key={row.item.id}
                kind="lost"
                itemName={row.item.itemName}
                category={row.item.category}
                description={row.item.description}
                location={row.item.location}
                date={row.item.dateLost}
                photoUrl={row.item.photoUrl}
                status={row.item.status}
                reporter={row.reporter}
                isMine={row.item.userId === user.id}
                onMessage={() => messageUser(row.reporter.id, row.item.itemName, "lost")}
              />
            ))}
          </AnimatePresence>
        </Grid>
      ) : (
        <Grid empty={foundItems.length === 0} emptyMsg="No found items reported matching your filters.">
          <AnimatePresence>
            {foundItems.map((row) => (
              <ItemCard
                key={row.item.id}
                kind="found"
                itemName={row.item.itemName}
                category={row.item.category}
                description={row.item.description}
                location={row.item.location}
                date={row.item.dateFound}
                photoUrl={row.item.photoUrl}
                status={row.item.status}
                reporter={row.reporter}
                isMine={row.item.userId === user.id}
                onMessage={() => messageUser(row.reporter.id, row.item.itemName, "found")}
              />
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <ReportLostModal open={showLostModal} onClose={() => setShowLostModal(false)} onCreated={() => setRefreshKey((k) => k + 1)} />
      <ReportFoundModal open={showFoundModal} onClose={() => setShowFoundModal(false)} onCreated={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children, empty, emptyMsg }: { children: React.ReactNode; empty: boolean; emptyMsg: string }) {
  if (empty) {
    return <EmptyState icon={PackageSearch} title="Nothing here yet" message={emptyMsg} />;
  }
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
