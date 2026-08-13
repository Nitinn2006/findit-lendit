const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700 ring-amber-200",
  matched: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  resolved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  available: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  lent: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  accepted: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  rejected: "bg-rose-100 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  returned: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  verified: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
