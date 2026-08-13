import { db } from "@/db";
import { borrowListings, borrowRequests, conversations, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
import { and, desc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role"); // incoming | outgoing

  const borrower = alias(users, "borrower");
  const lender = alias(users, "lender");

  const baseQuery = db
    .select({
      request: borrowRequests,
      listing: borrowListings,
      borrower: { id: borrower.id, name: borrower.name, department: borrower.department, ratingAvg: borrower.ratingAvg, ratingCount: borrower.ratingCount },
      lender: { id: lender.id, name: lender.name, department: lender.department, ratingAvg: lender.ratingAvg, ratingCount: lender.ratingCount },
    })
    .from(borrowRequests)
    .innerJoin(borrowListings, eq(borrowRequests.listingId, borrowListings.id))
    .innerJoin(borrower, eq(borrowRequests.borrowerId, borrower.id))
    .innerJoin(lender, eq(borrowListings.userId, lender.id));

  const rows = await (role === "incoming"
    ? baseQuery.where(eq(borrowListings.userId, user.id))
    : role === "outgoing"
      ? baseQuery.where(eq(borrowRequests.borrowerId, user.id))
      : baseQuery.where(
          or(eq(borrowListings.userId, user.id), eq(borrowRequests.borrowerId, user.id)),
        )
  ).orderBy(desc(borrowRequests.requestedAt));

  return Response.json({ requests: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const listingId = String(body.listingId ?? "");
  const borrowDate = String(body.borrowDate ?? "").trim();
  const returnDate = String(body.returnDate ?? "").trim();
  const message = body.message ? String(body.message) : null;

  if (!listingId || !borrowDate || !returnDate) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const [listing] = await db
    .select()
    .from(borrowListings)
    .where(eq(borrowListings.id, listingId))
    .limit(1);
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (listing.userId === user.id) {
    return Response.json({ error: "You can't borrow your own item." }, { status: 400 });
  }
  if (listing.status !== "available") {
    return Response.json({ error: "This item is currently unavailable." }, { status: 400 });
  }

  const [created] = await db
    .insert(borrowRequests)
    .values({ listingId, borrowerId: user.id, borrowDate, returnDate, message })
    .returning();

  const existingConvo = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.contextType, "borrow"),
        eq(conversations.contextId, listingId),
        or(
          and(eq(conversations.userOneId, user.id), eq(conversations.userTwoId, listing.userId)),
          and(eq(conversations.userOneId, listing.userId), eq(conversations.userTwoId, user.id)),
        ),
      ),
    )
    .limit(1);

  if (existingConvo.length === 0) {
    await db.insert(conversations).values({
      userOneId: user.id,
      userTwoId: listing.userId,
      contextType: "borrow",
      contextId: listingId,
      contextLabel: listing.itemName,
    });
  }

  await pushNotification({
    userId: listing.userId,
    type: "borrow_request",
    title: "New borrow request",
    message: `${user.name} wants to borrow your ${listing.itemName} from ${borrowDate} to ${returnDate}.`,
    link: "/dashboard/borrow?tab=incoming",
  });

  return Response.json({ request: created });
}
