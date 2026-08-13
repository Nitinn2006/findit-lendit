import { db } from "@/db";
import { lostItems, foundItems, matches, borrowListings, borrowRequests, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import OverviewClient from "@/components/dashboard/OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [myLost, myFound, myListings, pendingMatches, activeBorrows, activeLendings, unread] = await Promise.all([
    db.select().from(lostItems).where(eq(lostItems.userId, user.id)),
    db.select().from(foundItems).where(eq(foundItems.userId, user.id)),
    db.select().from(borrowListings).where(eq(borrowListings.userId, user.id)),
    db
      .select({ match: matches, lostItem: lostItems })
      .from(matches)
      .innerJoin(lostItems, eq(matches.lostItemId, lostItems.id))
      .where(and(eq(lostItems.userId, user.id), eq(matches.status, "pending"))),
    db
      .select()
      .from(borrowRequests)
      .where(and(eq(borrowRequests.borrowerId, user.id), eq(borrowRequests.status, "accepted"))),
    db
      .select({ request: borrowRequests, listing: borrowListings })
      .from(borrowRequests)
      .innerJoin(borrowListings, eq(borrowRequests.listingId, borrowListings.id))
      .where(and(eq(borrowListings.userId, user.id), eq(borrowRequests.status, "accepted"))),
    db.select().from(notifications).where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false))),
  ]);

  const stats = {
    activeLost: myLost.filter((i) => i.status !== "resolved").length,
    activeFound: myFound.filter((i) => i.status !== "resolved").length,
    totalListings: myListings.length,
    pendingMatches: pendingMatches.length,
    activeBorrows: activeBorrows.length,
    activeLendings: activeLendings.length,
    unread: unread.length,
    ratingAvg: user.ratingAvg,
    ratingCount: user.ratingCount,
  };

  return <OverviewClient user={user} stats={stats} />;
}
