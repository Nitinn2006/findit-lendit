"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{
  push: (kind: ToastKind, message: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    success: (message: string) => ctx.push("success", message),
    error: (message: string) => ctx.push("error", message),
    info: (message: string) => ctx.push("info", message),
  };
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[999] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${STYLES[t.kind]}`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="text-current/60 hover:text-current"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
