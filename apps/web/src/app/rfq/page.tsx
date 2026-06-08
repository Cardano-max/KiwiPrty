import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { getCustomerId } from "@/server/session";
import { listCustomerRfqs } from "@/server/services/rfq";
import { listCategories } from "@/server/services/catalog";
import { createRfqAction } from "@/server/actions";
import { SubmitButton, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RfqPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (session?.role === "supplier") redirect("/rfq/board");
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login?next=/rfq");

  const [rfqs, categories] = await Promise.all([listCustomerRfqs(customerId), listCategories()]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form action={createRfqAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold">Post a requirement (RFQ)</h2>
          {sp.error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-500">What do you need? *</label>
            <input name="title" required placeholder="e.g. 500 blue latex balloons" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Category</label>
              <select name="categoryId" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Quantity</label>
              <input name="targetQty" type="number" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Details</label>
            <textarea name="detail" rows={3} placeholder="Delivery city, deadline, etc." className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <SubmitButton className="w-full">Post requirement</SubmitButton>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h1 className="mb-3 text-2xl font-bold">Your requirements</h1>
        {sp.posted && (
          <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Posted — suppliers can now send you quotes.
          </div>
        )}
        {rfqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No requirements yet. Post one to get quotes from suppliers.
          </div>
        ) : (
          <div className="space-y-2">
            {rfqs.map((r) => (
              <Link key={r.id} href={`/rfq/${r.id}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.title}</span>
                  <Badge tone={r.status === "open" ? "green" : "gray"}>{r.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {r.category?.name ?? "Any category"}
                  {r.targetQty ? ` · qty ${r.targetQty}` : ""} · {r._count.quotes} quote(s)
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
