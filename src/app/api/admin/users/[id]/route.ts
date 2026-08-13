import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return Response.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const patch: Partial<typeof users.$inferInsert> = {};
  if (typeof body.isVerified === "boolean") patch.isVerified = body.isVerified;
  if (typeof body.isBanned === "boolean") patch.isBanned = body.isBanned;
  if (typeof body.isAdmin === "boolean") patch.isAdmin = body.isAdmin;

  const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
  return Response.json({
    user: updated
      ? {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          isAdmin: updated.isAdmin,
          isVerified: updated.isVerified,
          isBanned: updated.isBanned,
        }
      : null,
  });
}
