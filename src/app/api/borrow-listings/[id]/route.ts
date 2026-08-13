import { db } from "@/db";
import { borrowListings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const [existing] = await db
    .select()
    .from(borrowListings)
    .where(eq(borrowListings.id, id))
    .limit(1);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });
  if (existing.userId !== user.id && !user.isAdmin) {
    return Response.json({ error: "Not allowed." }, { status: 403 });
  }

  const patch: Partial<typeof borrowListings.$inferInsert> = {};
  if (body.status) patch.status = String(body.status);

  const [updated] = await db
    .update(borrowListings)
    .set(patch)
    .where(eq(borrowListings.id, id))
    .returning();

  return Response.json({ listing: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(borrowListings)
    .where(eq(borrowListings.id, id))
    .limit(1);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });
  if (existing.userId !== user.id && !user.isAdmin) {
    return Response.json({ error: "Not allowed." }, { status: 403 });
  }

  await db.delete(borrowListings).where(eq(borrowListings.id, id));
  return Response.json({ ok: true });
}
