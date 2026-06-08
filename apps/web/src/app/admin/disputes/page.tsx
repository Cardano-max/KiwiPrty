import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/server/session";
import { listAllDisputes } from "@/server/services/community";
import { resolveDisputeAction } from "@/server/actions";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "in_review", "resolved", "closed"];

export default async function AdminDisputesPage() {
  if (!(await isAdmin())) redirect("/login?next=/admin/disputes");
  const disputes = await listAllDisputes();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-sm text-kiwi-600 hover:underline">← Admin</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Support tickets</h1>

      {disputes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No tickets.
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{d.subject}</span>
                <Badge tone={d.status === "resolved" ? "green" : "amber"}>{d.status.replace("_", " ")}</Badge>
              </div>
              <div className="text-xs text-gray-500">
                from {d.raisedBy.name ?? d.raisedBy.phone} · {new Date(d.createdAt).toLocaleString("en-IN")}
                {d.orderId ? ` · order ${d.orderId.slice(-6).toUpperCase()}` : ""}
              </div>
              <p className="mt-1 text-sm text-gray-700">{d.message}</p>

              <form action={resolveDisputeAction} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={d.id} />
                <textarea
                  name="response"
                  rows={2}
                  defaultValue={d.response ?? ""}
                  placeholder="Response to the user"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2">
                  <select name="status" defaultValue={d.status} className="rounded border border-gray-300 px-2 py-1 text-sm">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-kiwi-600 px-3 py-1 text-sm font-semibold text-white hover:bg-kiwi-700">
                    Update &amp; notify
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
