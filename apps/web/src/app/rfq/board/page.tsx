import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { listOpenRfqs } from "@/server/services/rfq";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RfqBoardPage() {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/rfq/board");
  const rfqs = await listOpenRfqs();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Buyer requirements (RFQ board)</h1>
      <p className="mb-4 text-sm text-gray-500">Open requirements from verified buyers — send a quote to win the order.</p>

      {rfqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No open requirements right now.
        </div>
      ) : (
        <div className="space-y-2">
          {rfqs.map((r) => (
            <Link key={r.id} href={`/rfq/${r.id}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.title}</span>
                <Badge tone="kiwi">{r._count.quotes} quote(s)</Badge>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {r.category?.name ?? "Any category"}
                {r.targetQty ? ` · qty ${r.targetQty}` : ""} · from {r.customer.shopName}
                {r.customer.city ? `, ${r.customer.city}` : ""}
              </div>
              {r.detail ? <div className="mt-1 text-sm text-gray-600">{r.detail}</div> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
