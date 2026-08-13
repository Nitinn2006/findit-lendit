import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (user.isBanned) {
      return Response.json(
        { error: "This account has been suspended by admin." },
        { status: 403 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.id);

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        department: user.department,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
