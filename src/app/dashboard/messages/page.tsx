import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { conversations, users } from "@/db/schema";
import { eq, or, desc, inArray } from "drizzle-orm";

export default async function MessagesPage() {
    const user = await requireUser();

    const convos = await db
        .select()
        .from(conversations)
        .where(or(eq(conversations.userOneId, user.id), eq(conversations.userTwoId, user.id)))
        .orderBy(desc(conversations.lastMessageAt));

    const otherUserIds = convos.map((c) =>
        c.userOneId === user.id ? c.userTwoId : c.userOneId
    );

    const otherUsers = otherUserIds.length
        ? await db.select().from(users).where(inArray(users.id, otherUserIds))
        : [];

    const otherUserMap = new Map(otherUsers.map((u) => [u.id, u]));

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Messages</h1>
            {convos.length === 0 ? (
                <p className="text-slate-500">No conversations yet.</p>
            ) : (
                <ul className="space-y-2">
                    {convos.map((c) => {
                        const otherId = c.userOneId === user.id ? c.userTwoId : c.userOneId;
                        const other = otherUserMap.get(otherId);
                        return (
                            <li key={c.id} className="rounded-xl border border-slate-200 p-4">
                                <p className="font-semibold">{other?.name ?? "Unknown user"}</p>
                                {c.contextLabel && (
                                    <p className="text-xs text-slate-500">{c.contextLabel}</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}