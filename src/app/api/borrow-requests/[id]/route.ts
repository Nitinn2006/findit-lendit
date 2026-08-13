import { db } from "@/db";
import { borrowListings, borrowRequests } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const action = String(body.action ?? "");

  const [row] = await db
    .select({ request: borrowRequests, listing: borrowListings })
    .from(borrowRequests)
    .innerJoin(borrowListings, eq(borrowRequests.listingId, borrowListings.id))
    .where(eq(borrowRequests.id, id))
    .limit(1);

  if (!row) return Response.json({ error: "Request not found." }, { status: 404 });
  const { request, listing } = row;
  const isLender = listing.userId === user.id;
  const isBorrower = request.borrowerId === user.id;
  if (!isLender && !isBorrower && !user.isAdmin) {
    return Response.json({ error: "Not allowed." }, { status: 403 });
  }

  if (action === "accept") {
    if (!isLender) return Response.json({ error: "Only the lender can accept." }, { status: 403 });
    if (request.status !== "pending") {
      return Response.json({ error: "Request already handled." }, { status: 400 });
    }
    await db
      .update(borrowRequests)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(borrowRequests.id, id));
    await db.update(borrowListings).set({ status: "lent" }).where(eq(borrowListings.id, listing.id));
    await pushNotification({
      userId: request.borrowerId,
      type: "borrow_accepted",
      title: "Borrow request accepted!",
      message: `Your request to borrow "${listing.itemName}" was accepted. Pick it up and return by ${request.returnDate}.`,
      link: "/dashboard/borrow?tab=outgoing",
    });
    return Response.json({ ok: true });
  }

  if (action === "reject") {
    if (!isLender) return Response.json({ error: "Only the lender can reject." }, { status: 403 });
    if (request.status !== "pending") {
      return Response.json({ error: "Request already handled." }, { status: 400 });
    }
    await db
      .update(borrowRequests)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(borrowRequests.id, id));
    await pushNotification({
      userId: request.borrowerId,
      type: "borrow_rejected",
      title: "Borrow request declined",
      message: `Your request to borrow "${listing.itemName}" was declined.`,
      link: "/dashboard/borrow?tab=outgoing",
    });
    return Response.json({ ok: true });
  }

  if (action === "cancel") {
    if (!isBorrower) return Response.json({ error: "Only the borrower can cancel." }, { status: 403 });
    if (request.status !== "pending") {
      return Response.json({ error: "Request already handled." }, { status: 400 });
    }
    await db.update(borrowRequests).set({ status: "cancelled" }).where(eq(borrowRequests.id, id));
    return Response.json({ ok: true });
  }

  if (action === "return") {
    if (!isLender && !isBorrower) {
      return Response.json({ error: "Not allowed." }, { status: 403 });
    }
    if (request.status !== "accepted") {
      return Response.json({ error: "This item isn't currently lent out." }, { status: 400 });
    }
    await db
      .update(borrowRequests)
      .set({ status: "returned", returnedAt: new Date() })
      .where(eq(borrowRequests.id, id));
    await db
      .update(borrowListings)
      .set({ status: "available" })
      .where(eq(borrowListings.id, listing.id));
    await pushNotification({
      userId: isLender ? request.borrowerId : listing.userId,
      type: "returned",
      title: "Item returned",
      message: `"${listing.itemName}" has been marked as returned. Don't forget to rate each other!`,
      link: "/dashboard/borrow",
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unsupported action." }, { status: 400 });
}
