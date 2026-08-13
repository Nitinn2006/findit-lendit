import { db } from "@/db";
import { lostItems, foundItems, matches, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
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
  if (category) conditions.push(eq(lostItems.category, category));
  if (status) conditions.push(eq(lostItems.status, status));
  if (q) conditions.push(ilike(lostItems.itemName, `%${q}%`));
  if (mine === "true" && user) conditions.push(eq(lostItems.userId, user.id));
  if (department) conditions.push(eq(users.department, department));

  const rows = await db
    .select({
      item: lostItems,
      reporter: {
        id: users.id,
        name: users.name,
        department: users.department,
        ratingAvg: users.ratingAvg,
        ratingCount: users.ratingCount,
      },
    })
    .from(lostItems)
    .innerJoin(users, eq(lostItems.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(lostItems.createdAt));

  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const itemName = String(body.itemName ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = String(body.location ?? "").trim();
  const dateLost = String(body.dateLost ?? "").trim();
  const photoUrl = body.photoUrl ? String(body.photoUrl) : null;

  if (!itemName || !category || !description || !location || !dateLost) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const [created] = await db
    .insert(lostItems)
    .values({ userId: user.id, itemName, category, description, location, dateLost, photoUrl })
    .returning();

  // Auto-match against existing found items in the same category
  const candidates = await db
    .select()
    .from(foundItems)
    .where(and(eq(foundItems.category, category), eq(foundItems.status, "open")));

  const firstWord = itemName.toLowerCase().split(" ")[0];
  const matched = candidates.filter((f) => {
    const foundFirstWord = f.itemName.toLowerCase().split(" ")[0];
    return (
      f.category === category &&
      (f.itemName.toLowerCase().includes(firstWord) ||
        itemName.toLowerCase().includes(foundFirstWord))
    );
  });

  for (const found of matched.slice(0, 5)) {
    await db.insert(matches).values({ lostItemId: created.id, foundItemId: found.id });
    await db.update(lostItems).set({ status: "matched" }).where(eq(lostItems.id, created.id));
    await db.update(foundItems).set({ status: "matched" }).where(eq(foundItems.id, found.id));
    await pushNotification({
      userId: user.id,
      type: "match",
      title: "Possible match found!",
      message: `A found report for "${found.itemName}" near ${found.location} might match your lost ${itemName}.`,
      link: "/dashboard/lost-found?tab=matches",
    });
    await pushNotification({
      userId: found.userId,
      type: "match",
      title: "Possible owner found!",
      message: `Someone reported losing "${itemName}" which may match the ${found.itemName} you found.`,
      link: "/dashboard/lost-found?tab=matches",
    });
  }

  return Response.json({ item: created, matchesCreated: matched.length });
}
