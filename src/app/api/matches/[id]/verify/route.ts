import { db } from "@/db";
import { matches, lostItems, foundItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const answer = String(body.answer ?? "").trim();

  const [row] = await db
    .select({ match: matches, lostItem: lostItems, foundItem: foundItems })
    .from(matches)
    .innerJoin(lostItems, eq(matches.lostItemId, lostItems.id))
    .innerJoin(foundItems, eq(matches.foundItemId, foundItems.id))
    .where(eq(matches.id, id))
    .limit(1);

  if (!row) return Response.json({ error: "Match not found." }, { status: 404 });
  if (row.lostItem.userId !== user.id) {
    return Response.json(
      { error: "Only the person who lost the item can verify ownership." },
      { status: 403 },
    );
  }
  if (row.match.status !== "pending") {
    return Response.json({ error: "This match has already been resolved." }, { status: 400 });
  }

  const isCorrect =
    answer.toLowerCase() === row.foundItem.verificationAnswer.trim().toLowerCase();

  if (isCorrect) {
    await db
      .update(matches)
      .set({ status: "verified", verifiedAt: new Date() })
      .where(eq(matches.id, id));
    await db.update(lostItems).set({ status: "resolved" }).where(eq(lostItems.id, row.lostItem.id));
    await db
      .update(foundItems)
      .set({ status: "resolved" })
      .where(eq(foundItems.id, row.foundItem.id));

    await pushNotification({
      userId: row.foundItem.userId,
      type: "verified",
      title: "Ownership verified!",
      message: `${user.name} correctly verified ownership of "${row.foundItem.itemName}". Arrange the handover and don't forget to rate each other!`,
      link: "/dashboard/lost-found?tab=matches",
    });
    await pushNotification({
      userId: user.id,
      type: "verified",
      title: "You're verified as the owner!",
      message: `You answered correctly for "${row.foundItem.itemName}". Contact the finder to collect your item.`,
      link: "/dashboard/lost-found?tab=matches",
    });

    return Response.json({ ok: true, verified: true });
  }

  const attempts = row.match.attempts + 1;
  if (attempts >= 3) {
    await db
      .update(matches)
      .set({ status: "rejected", attempts })
      .where(eq(matches.id, id));
    await db.update(lostItems).set({ status: "open" }).where(eq(lostItems.id, row.lostItem.id));
    await db
      .update(foundItems)
      .set({ status: "open" })
      .where(eq(foundItems.id, row.foundItem.id));
    return Response.json({
      ok: true,
      verified: false,
      rejected: true,
      error: "Too many incorrect attempts. This match has been cancelled.",
    });
  }

  await db.update(matches).set({ attempts }).where(eq(matches.id, id));
  return Response.json({
    ok: true,
    verified: false,
    attemptsLeft: 3 - attempts,
    error: "That answer doesn't match. Try again.",
  });
}
