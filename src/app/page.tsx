import { getCurrentUser } from "@/lib/auth";
import LandingPage from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <LandingPage isLoggedIn={!!user} isAdmin={!!user?.isAdmin} />;
}
