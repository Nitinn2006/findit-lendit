"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, User, IdCard, Building2, Loader2 } from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    collegeId: string;
    department: string;
    password: string;
  }>({
    name: "",
    email: "",
    collegeId: "",
    department: DEPARTMENTS[0],
    password: "",
  });
  const router = useRouter();
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      toast.success(mode === "login" ? "Welcome back!" : "Account created! Welcome aboard.");
      router.push(data.user?.isAdmin ? "/dashboard/admin" : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -left-24 top-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="animate-blob absolute right-0 bottom-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl [animation-delay:4s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl shadow-md">
            🎒
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
            Campus Share Hub
          </span>
        </Link>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative rounded-full py-2 text-sm font-semibold transition ${
                mode === m ? "text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-pill"
                  className="absolute inset-0 rounded-full bg-slate-900"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{m === "login" ? "Log In" : "Sign Up"}</span>
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
          <GraduationCap className="h-4 w-4 shrink-0" />
          Use your college email & ID — every account is verified for a trusted campus.
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "login" ? 12 : -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={submit}
            className="space-y-4"
          >
            {mode === "signup" && (
              <Field icon={User} label="Full Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aditi Sharma"
                  className="input"
                />
              </Field>
            )}
            <Field icon={Mail} label="College Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@college.edu"
                className="input"
              />
            </Field>
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={IdCard} label="College ID">
                  <input
                    required
                    value={form.collegeId}
                    onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                    placeholder="CS2023045"
                    className="input"
                  />
                </Field>
                <Field icon={Building2} label="Department">
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="input"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            <Field icon={Lock} label="Password">
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </motion.form>
        </AnimatePresence>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree this is a verified student community platform.
        </p>
      </motion.div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.6rem 0.75rem 0.6rem 2.25rem;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: all 0.15s ease;
        }
        .input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </label>
  );
}
