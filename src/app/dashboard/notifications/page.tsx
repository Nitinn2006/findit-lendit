import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CheckCircle2, Search, MessageCircle, Bell } from "lucide-react";

const ICONS: Record<string, any> = {
    match: Search,
    verify: CheckCircle2,
    message: MessageCircle,
};

function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default async function NotificationsPage() {
    const user = await requireUser();
    const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt));

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold">Notifications</h1>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                    <Bell className="h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">No notifications yet.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {items.map((n) => {
                        const Icon = ICONS[n.type] ?? Bell;
                        const isUnread = !n.isRead;
                        return (
                            <li
                                key={n.id}
                                className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                                    isUnread
                                        ? "border-indigo-200 bg-indigo-50/60"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div
                                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                        isUnread ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    {n.title && <p className="text-sm font-semibold text-slate-800">{n.title}</p>}
                                    <p className="text-sm text-slate-600">{n.message}</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {n.createdAt ? timeAgo(new Date(n.createdAt)) : ""}
                                    </p>
                                </div>
                                {isUnread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}