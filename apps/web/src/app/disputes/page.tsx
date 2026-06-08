import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { listUserDisputes } from "@/server/services/community";
import { createDisputeAction } from "@/server/actions";
import { SubmitButton, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; raised?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const s = await getSession();
  if (!s) redirect("/login?next=/disputes");
  const disputes = await listUserDisputes(s.userId);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-3 text-2xl font-bold">Support &amp; disputes</h1>

      <form action={createDisputeAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">Raise a ticket</h2>
        {sp.error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>}
        {sp.raised && <div className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Ticket raised — our team will respond.</div>}
        {sp.orderId && <input type="hidden" name="orderId" value={sp.orderId} />}
        <input name="subject" required placeholder="Subject" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <textarea name="message" required rows={3} placeholder="Describe the issue" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <SubmitButton>Submit ticket</SubmitButton>
      </form>

      <h2 className="mb-2 mt-6 text-lg font-bold">Your tickets</h2>
      {disputes.length === 0 ? (
        <p className="text-sm text-gray-500">No tickets yet.</p>
      ) : (
        <div className="space-y-2">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{d.subject}</span>
                <Badge tone={d.status === "resolved" ? "green" : d.status === "closed" ? "gray" : "amber"}>
                  {d.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">{d.message}</p>
              {d.response ? (
                <p className="mt-2 rounded-lg bg-kiwi-50 px-3 py-2 text-sm text-kiwi-800">
                  <b>Response:</b> {d.response}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
