import { db } from "@/db";
import { borrowListings, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq, ilike } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const department = searchParams.get("department");
  const q = searchParams.get("q");
  const mine = searchParams.get("mine");
  const status = searchParams.get("status");

  const user = await getCurrentUser();

  const conditions = [];
  if (category) conditions.push(eq(borrowListings.category, category));
  if (status) conditions.push(eq(borrowListings.status, status));
  if (q) conditions.push(ilike(borrowListings.itemName, `%${q}%`));
  if (mine === "true" && user) conditions.push(eq(borrowListings.userId, user.id));
  if (department) conditions.push(eq(users.department, department));

  const rows = await db
    .select({
      listing: borrowListings,
      lender: {
        id: users.id,
        name: users.name,
        department: users.department,
        ratingAvg: users.ratingAvg,
        ratingCount: users.ratingCount,
      },
    })
    .from(borrowListings)
    .innerJoin(users, eq(borrowListings.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(borrowListings.createdAt));

  return Response.json({ listings: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const itemName = String(body.itemName ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const availableFrom = String(body.availableFrom ?? "").trim();
  const availableTo = String(body.availableTo ?? "").trim();
  const photoUrl = body.photoUrl ? String(body.photoUrl) : null;

  if (!itemName || !category || !description || !availableFrom || !availableTo) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const [created] = await db
    .insert(borrowListings)
    .values({ userId: user.id, itemName, category, description, availableFrom, availableTo, photoUrl })
    .returning();

  return Response.json({ listing: created });
}
