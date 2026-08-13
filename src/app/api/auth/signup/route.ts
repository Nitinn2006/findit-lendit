import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const collegeId = String(body.collegeId ?? "").trim();
    const department = String(body.department ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !email || !collegeId || !department || !password) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    if (!email.includes("@")) {
      return Response.json({ error: "Enter a valid college email." }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(users);

    const passwordHash = await hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        collegeId,
        department,
        passwordHash,
        isVerified: true,
        isAdmin: total === 0,
      })
      .returning();

    await createSession(created.id);

    return Response.json({
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        collegeId: created.collegeId,
        department: created.department,
        isAdmin: created.isAdmin,
        isVerified: created.isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
