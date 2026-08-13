import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  return Response.json({ ok: true });
}
