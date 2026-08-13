import { db } from "@/db";
import { matches, lostItems, foundItems, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const owner = alias(users, "owner");
  const finder = alias(users, "finder");

  const rows = await db
    .select({
      match: matches,
      lostItem: lostItems,
      foundItem: {
        id: foundItems.id,
        itemName: foundItems.itemName,
        category: foundItems.category,
        description: foundItems.description,
        location: foundItems.location,
        dateFound: foundItems.dateFound,
        photoUrl: foundItems.photoUrl,
        verificationQuestion: foundItems.verificationQuestion,
        status: foundItems.status,
        userId: foundItems.userId,
      },
      owner: { id: owner.id, name: owner.name, department: owner.department },
      finder: { id: finder.id, name: finder.name, department: finder.department },
    })
    .from(matches)
    .innerJoin(lostItems, eq(matches.lostItemId, lostItems.id))
    .innerJoin(foundItems, eq(matches.foundItemId, foundItems.id))
    .innerJoin(owner, eq(lostItems.userId, owner.id))
    .innerJoin(finder, eq(foundItems.userId, finder.id))
    .where(or(eq(lostItems.userId, user.id), eq(foundItems.userId, user.id)))
    .orderBy(desc(matches.createdAt));

  const withRole = rows.map((r) => ({
    ...r,
    myRole: r.lostItem.userId === user.id ? ("owner" as const) : ("finder" as const),
  }));

  return Response.json({ matches: withRole });
}
