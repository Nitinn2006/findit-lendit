import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Campus Share Hub | Lost & Found + Borrow & Lend",
  description:
    "One platform for Lost & Found and Borrowing & Sharing inside your college. Report lost items, claim found items, borrow and lend with your campus community.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-[#f6f7fb] font-[family-name:var(--font-body)] text-slate-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
