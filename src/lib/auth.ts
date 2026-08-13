import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const SESSION_COOKIE = "csh_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBanned: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
};

function toSafeUser(u: typeof users.$inferSelect): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    collegeId: u.collegeId,
    department: u.department,
    isAdmin: u.isAdmin,
    isVerified: u.isVerified,
    isBanned: u.isBanned,
    ratingAvg: u.ratingAvg,
    ratingCount: u.ratingCount,
    createdAt: u.createdAt,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ userId, token, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (rows.length === 0) return null;
  return toSafeUser(rows[0].user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
