import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return Response.json({ notifications: rows });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, user.id));
  return Response.json({ ok: true });
}
