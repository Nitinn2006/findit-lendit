import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const userOne = alias(users, "user_one");
  const userTwo = alias(users, "user_two");

  const rows = await db
    .select({
      conversation: conversations,
      userOne: { id: userOne.id, name: userOne.name },
      userTwo: { id: userTwo.id, name: userTwo.name },
    })
    .from(conversations)
    .innerJoin(userOne, eq(conversations.userOneId, userOne.id))
    .innerJoin(userTwo, eq(conversations.userTwoId, userTwo.id))
    .where(or(eq(conversations.userOneId, user.id), eq(conversations.userTwoId, user.id)))
    .orderBy(desc(conversations.lastMessageAt));

  const results = [];
  for (const row of rows) {
    const other = row.conversation.userOneId === user.id ? row.userTwo : row.userOne;
    const [lastMessage] = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, row.conversation.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);
    const unread = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, row.conversation.id),
          ne(messages.senderId, user.id),
          isNull(messages.readAt),
        ),
      );
    results.push({
      id: row.conversation.id,
      contextType: row.conversation.contextType,
      contextLabel: row.conversation.contextLabel,
      lastMessageAt: row.conversation.lastMessageAt,
      otherUser: other,
      lastMessage: lastMessage ?? null,
      unreadCount: unread[0]?.count ?? 0,
    });
  }

  return Response.json({ conversations: results });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const otherUserId = String(body.otherUserId ?? "");
  const contextType = body.contextType ? String(body.contextType) : null;
  const contextId = body.contextId ? String(body.contextId) : null;
  const contextLabel = body.contextLabel ? String(body.contextLabel) : null;

  if (!otherUserId || otherUserId === user.id) {
    return Response.json({ error: "Invalid recipient." }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(eq(conversations.userOneId, user.id), eq(conversations.userTwoId, otherUserId)),
        and(eq(conversations.userOneId, otherUserId), eq(conversations.userTwoId, user.id)),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ conversation: existing[0] });
  }

  const [created] = await db
    .insert(conversations)
    .values({ userOneId: user.id, userTwoId: otherUserId, contextType, contextId, contextLabel })
    .returning();

  return Response.json({ conversation: created });
}
