import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { listNotifications } from "@/server/services/notifications";
import { markAllReadAction } from "@/server/actions";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = {
  order: "📦",
  inquiry: "💬",
  payment: "💳",
  system: "🔔",
};

export default async function NotificationsPage() {
  const s = await getSession();
  if (!s) redirect("/login?next=/notifications");
  const items = await listNotifications(s.userId);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {items.some((n) => !n.read) && (
          <form action={markAllReadAction}>
            <button className="text-sm font-semibold text-kiwi-600 hover:underline">Mark all read</button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div
                className={`rounded-xl border p-3 ${n.read ? "border-gray-200 bg-white" : "border-kiwi-200 bg-kiwi-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {ICON[n.type] ?? "🔔"} {n.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                {n.body && <p className="mt-1 text-sm text-gray-600">{n.body}</p>}
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
