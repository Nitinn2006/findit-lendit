import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { UserProvider } from "@/components/UserContext";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <UserProvider user={user}>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
