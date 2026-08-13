import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { pushNotification } from "@/lib/notify";
import { and, asc, eq, isNull, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function assertParticipant(conversationId: string, userId: string) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!convo) return null;
  if (convo.userOneId !== userId && convo.userTwoId !== userId) return null;
  return convo;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  const convo = await assertParticipant(id, user.id);
  if (!convo) return Response.json({ error: "Conversation not found." }, { status: 404 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(eq(messages.conversationId, id), ne(messages.senderId, user.id), isNull(messages.readAt)),
    );

  return Response.json({
    messages: rows,
    otherUserId: convo.userOneId === user.id ? convo.userTwoId : convo.userOneId,
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;

  const convo = await assertParticipant(id, user.id);
  if (!convo) return Response.json({ error: "Conversation not found." }, { status: 404 });

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) return Response.json({ error: "Message cannot be empty." }, { status: 400 });

  const [created] = await db
    .insert(messages)
    .values({ conversationId: id, senderId: user.id, content })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, id));

  const otherUserId = convo.userOneId === user.id ? convo.userTwoId : convo.userOneId;
  await pushNotification({
    userId: otherUserId,
    type: "message",
    title: `New message from ${user.name}`,
    message: content.length > 80 ? `${content.slice(0, 80)}...` : content,
    link: "/dashboard/chat",
  });

  return Response.json({ message: created });
}
