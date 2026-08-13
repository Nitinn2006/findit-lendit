import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
    const user = await requireUser();

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Profile</h1>
            <div className="max-w-md space-y-3 rounded-2xl border border-slate-200 p-6">
                <p><span className="font-semibold">Name:</span> {user.name}</p>
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                <p><span className="font-semibold">College ID:</span> {user.collegeId}</p>
                <p><span className="font-semibold">Department:</span> {user.department}</p>
            </div>
        </div>
    );
}