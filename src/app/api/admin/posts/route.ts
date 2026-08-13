import { db } from "@/db";
import { lostItems, foundItems, borrowListings, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return Response.json({ error: "Admins only." }, { status: 403 });

  const lost = await db
    .select({ item: lostItems, reporter: { id: users.id, name: users.name } })
    .from(lostItems)
    .innerJoin(users, eq(lostItems.userId, users.id))
    .orderBy(desc(lostItems.createdAt));

  const found = await db
    .select({ item: foundItems, reporter: { id: users.id, name: users.name } })
    .from(foundItems)
    .innerJoin(users, eq(foundItems.userId, users.id))
    .orderBy(desc(foundItems.createdAt));

  const listings = await db
    .select({ item: borrowListings, reporter: { id: users.id, name: users.name } })
    .from(borrowListings)
    .innerJoin(users, eq(borrowListings.userId, users.id))
    .orderBy(desc(borrowListings.createdAt));

  return Response.json({
    lost: lost.map((r) => ({ ...r, type: "lost" as const })),
    found: found.map((r) => ({ ...r, type: "found" as const })),
    listings: listings.map((r) => ({ ...r, type: "borrow" as const })),
  });
}
