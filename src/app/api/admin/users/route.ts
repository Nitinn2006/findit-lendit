import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return Response.json({ error: "Admins only." }, { status: 403 });

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      collegeId: users.collegeId,
      department: users.department,
      isAdmin: users.isAdmin,
      isVerified: users.isVerified,
      isBanned: users.isBanned,
      ratingAvg: users.ratingAvg,
      ratingCount: users.ratingCount,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return Response.json({ users: rows });
}
