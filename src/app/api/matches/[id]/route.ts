import { db } from "@/db";
import { matches, lostItems, foundItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const [row] = await db
    .select({ match: matches, lostItem: lostItems, foundItem: foundItems })
    .from(matches)
    .innerJoin(lostItems, eq(matches.lostItemId, lostItems.id))
    .innerJoin(foundItems, eq(matches.foundItemId, foundItems.id))
    .where(eq(matches.id, id))
    .limit(1);

  if (!row) return Response.json({ error: "Match not found." }, { status: 404 });
  if (row.lostItem.userId !== user.id && row.foundItem.userId !== user.id && !user.isAdmin) {
    return Response.json({ error: "Not allowed." }, { status: 403 });
  }

  if (body.action === "reject") {
    await db.update(matches).set({ status: "rejected" }).where(eq(matches.id, id));
    await db.update(lostItems).set({ status: "open" }).where(eq(lostItems.id, row.lostItem.id));
    await db
      .update(foundItems)
      .set({ status: "open" })
      .where(eq(foundItems.id, row.foundItem.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unsupported action." }, { status: 400 });
}
