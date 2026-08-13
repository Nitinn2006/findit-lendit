"use client";

import { useEffect, useState } from "react";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    collegeId: string;
    department: string;
    isAdmin: boolean;
    isVerified: boolean;
    isBanned: boolean;
    ratingAvg: number;
    ratingCount: number;
    createdAt: string;
};

type AdminPost = {
    type: "lost" | "found" | "borrow";
    reporter: { id: string; name: string };
    item: Record<string, any>;
};

export default function AdminPage() {
    const [tab, setTab] = useState<"users" | "posts">("users");
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            if (tab === "users") {
                const res = await fetch("/api/admin/users");
                const data = await res.json();
                setUsers(data.users ?? []);
            } else {
                const res = await fetch("/api/admin/posts");
                const data = await res.json();
                setPosts([...(data.lost ?? []), ...(data.found ?? []), ...(data.listings ?? [])]);
            }
            setLoading(false);
        }
        load().catch((err) => {
            console.error("Failed to load admin data:", err);
            setLoading(false);
        });
    }, [tab]);

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Admin</h1>

            <div className="mb-6 flex gap-2 rounded-full bg-slate-100 p-1 w-fit">
                {(["users", "posts"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                            tab === t ? "bg-slate-900 text-white" : "text-slate-500"
                        }`}
                    >
                        {t === "users" ? "Users" : "Posts"}
                    </button>
                ))}
            </div>

            {loading && <p className="text-slate-500">Loading...</p>}

            {!loading && tab === "users" && (
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b text-left text-slate-500">
                        <th className="py-2">Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Rating</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-b">
                            <td className="py-2">{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.department}</td>
                            <td>{u.ratingAvg?.toFixed(1) ?? "—"} ({u.ratingCount})</td>
                            <td>
                                {u.isBanned ? (
                                    <span className="text-red-600 font-semibold">Banned</span>
                                ) : u.isAdmin ? (
                                    <span className="text-indigo-600 font-semibold">Admin</span>
                                ) : (
                                    <span className="text-slate-400">Active</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {!loading && tab === "posts" && (
                <ul className="space-y-2">
                    {posts.map((p, i) => (
                        <li key={i} className="rounded-xl border p-4">
              <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase">
                {p.type}
              </span>
                            <span className="font-semibold">
                {p.item.itemName ?? p.item.title ?? "Untitled"}
              </span>
                            <span className="ml-2 text-slate-400 text-xs">by {p.reporter.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}