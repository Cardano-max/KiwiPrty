import { isAdmin } from "@/server/session";
import { listFeatureRequests } from "@/server/services/community";
import { createFeatureRequestAction, voteFeatureAction, setFeatureStatusAction } from "@/server/actions";
import { SubmitButton, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "planned", "done", "declined"];

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [items, admin] = await Promise.all([listFeatureRequests(), isAdmin()]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form action={createFeatureRequestAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold">Suggest a feature</h2>
          {sp.error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>}
          <input name="title" required placeholder="Your idea" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <textarea name="detail" rows={3} placeholder="Details (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <SubmitButton className="w-full">Submit</SubmitButton>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h1 className="mb-3 text-2xl font-bold">Feature requests</h1>
        {sp.posted && (
          <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Thanks for the suggestion!</div>
        )}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No requests yet — be the first.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((f) => (
              <div key={f.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <form action={voteFeatureAction}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="flex flex-col items-center rounded-lg border border-gray-200 px-3 py-1 text-kiwi-700 hover:bg-kiwi-50">
                    <span className="text-sm">▲</span>
                    <span className="text-sm font-bold">{f.votes}</span>
                  </button>
                </form>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{f.title}</span>
                    <Badge tone={f.status === "done" ? "green" : f.status === "declined" ? "gray" : "kiwi"}>
                      {f.status}
                    </Badge>
                  </div>
                  {f.detail ? <p className="mt-1 text-sm text-gray-600">{f.detail}</p> : null}
                  {admin && (
                    <form action={setFeatureStatusAction} className="mt-2 flex items-center gap-2">
                      <input type="hidden" name="id" value={f.id} />
                      <select name="status" defaultValue={f.status} className="rounded border border-gray-300 px-2 py-1 text-xs">
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="rounded border border-kiwi-300 px-2 py-1 text-xs font-semibold text-kiwi-700">Set</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
