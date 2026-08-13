import { db } from "@/db";
import { lostItems, foundItems, borrowListings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return Response.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "lost") {
    await db.delete(lostItems).where(eq(lostItems.id, id));
  } else if (type === "found") {
    await db.delete(foundItems).where(eq(foundItems.id, id));
  } else if (type === "borrow") {
    await db.delete(borrowListings).where(eq(borrowListings.id, id));
  } else {
    return Response.json({ error: "Unknown post type." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
