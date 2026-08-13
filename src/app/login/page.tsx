import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.isAdmin ? "/dashboard/admin" : "/dashboard");

  return <AuthForm />;
}
