import { db } from "@/db";
import { lostItems, foundItems, matches, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
import { and, desc, eq, ilike } from "drizzle-orm";
import { matchScore } from "@/lib/constants";

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
  if (category) conditions.push(eq(foundItems.category, category));
  if (status) conditions.push(eq(foundItems.status, status));
  if (q) conditions.push(ilike(foundItems.itemName, `%${q}%`));
  if (mine === "true" && user) conditions.push(eq(foundItems.userId, user.id));
  if (department) conditions.push(eq(users.department, department));

  const rows = await db
    .select({
      item: foundItems,
      reporter: {
        id: users.id,
        name: users.name,
        department: users.department,
        ratingAvg: users.ratingAvg,
        ratingCount: users.ratingCount,
      },
    })
    .from(foundItems)
    .innerJoin(users, eq(foundItems.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(foundItems.createdAt));

  // never leak the verification answer to the public feed
  const sanitized = rows.map((r) => ({
    ...r,
    item: { ...r.item, verificationAnswer: undefined },
  }));

  return Response.json({ items: sanitized });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const itemName = String(body.itemName ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = String(body.location ?? "").trim();
  const dateFound = String(body.dateFound ?? "").trim();
  const photoUrl = body.photoUrl ? String(body.photoUrl) : null;
  const verificationQuestion = String(body.verificationQuestion ?? "").trim();
  const verificationAnswer = String(body.verificationAnswer ?? "").trim();

  if (
    !itemName ||
    !category ||
    !description ||
    !location ||
    !dateFound ||
    !verificationQuestion ||
    !verificationAnswer
  ) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const [created] = await db
    .insert(foundItems)
    .values({
      userId: user.id,
      itemName,
      category,
      description,
      location,
      dateFound,
      photoUrl,
      verificationQuestion,
      verificationAnswer,
    })
    .returning();

  const candidates = await db
    .select()
    .from(lostItems)
    .where(and(eq(lostItems.category, category), eq(lostItems.status, "open")));

  const scored = candidates
      .map((f) => ({ item: f, score: matchScore(itemName, f.itemName, location, f.location) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

  const matched = scored.slice(0, 3).map((s) => s.item);

  for (const lost of matched ) {
    await db.insert(matches).values({ lostItemId: lost.id, foundItemId: created.id });
    await db.update(lostItems).set({ status: "matched" }).where(eq(lostItems.id, lost.id));
    await db.update(foundItems).set({ status: "matched" }).where(eq(foundItems.id, created.id));
    await pushNotification({
      userId: lost.userId,
      type: "match",
      title: "Possible match found!",
      message: `A found report for "${itemName}" near ${location} might match your lost ${lost.itemName}.`,
      link: "/dashboard/lost-found?tab=matches",
    });
    await pushNotification({
      userId: user.id,
      type: "match",
      title: "Possible owner found!",
      message: `Someone reported losing "${lost.itemName}" which may match the ${itemName} you found.`,
      link: "/dashboard/lost-found?tab=matches",
    });
  }

  return Response.json({ item: created, matchesCreated: matched.length });
}
