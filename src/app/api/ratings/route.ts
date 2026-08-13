import { db } from "@/db";
import { ratings, borrowRequests, borrowListings, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, avg, count, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required." }, { status: 400 });

  const rows = await db
    .select({
      rating: ratings,
      rater: { id: users.id, name: users.name },
    })
    .from(ratings)
    .innerJoin(users, eq(ratings.raterId, users.id))
    .where(eq(ratings.ratedUserId, userId))
    .orderBy(desc(ratings.createdAt));

  return Response.json({ ratings: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const borrowRequestId = String(body.borrowRequestId ?? "");
  const stars = Number(body.stars ?? 0);
  const comment = body.comment ? String(body.comment) : null;

  if (!borrowRequestId || stars < 1 || stars > 5) {
    return Response.json({ error: "A valid borrow request and star rating are required." }, { status: 400 });
  }

  const [row] = await db
    .select({ request: borrowRequests, listing: borrowListings })
    .from(borrowRequests)
    .innerJoin(borrowListings, eq(borrowRequests.listingId, borrowListings.id))
    .where(eq(borrowRequests.id, borrowRequestId))
    .limit(1);

  if (!row) return Response.json({ error: "Borrow request not found." }, { status: 404 });
  if (row.request.status !== "returned") {
    return Response.json({ error: "You can only rate after the item is returned." }, { status: 400 });
  }

  const isBorrower = row.request.borrowerId === user.id;
  const isLender = row.listing.userId === user.id;
  if (!isBorrower && !isLender) {
    return Response.json({ error: "Not allowed." }, { status: 403 });
  }
  const ratedUserId = isBorrower ? row.listing.userId : row.request.borrowerId;

  const existing = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.raterId, user.id), eq(ratings.borrowRequestId, borrowRequestId)))
    .limit(1);
  if (existing.length > 0) {
    return Response.json({ error: "You already rated this exchange." }, { status: 409 });
  }

  await db.insert(ratings).values({ raterId: user.id, ratedUserId, borrowRequestId, stars, comment });

  const agg = await db
    .select({ avgStars: avg(ratings.stars), total: count(ratings.id) })
    .from(ratings)
    .where(eq(ratings.ratedUserId, ratedUserId));

  await db
    .update(users)
    .set({
      ratingAvg: Number(agg[0]?.avgStars ?? 0),
      ratingCount: Number(agg[0]?.total ?? 0),
    })
    .where(eq(users.id, ratedUserId));

  return Response.json({ ok: true });
}
