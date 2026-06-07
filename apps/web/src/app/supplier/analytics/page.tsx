import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { supplierAnalytics } from "@/server/services/reports";
import { Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

function FunnelStep({ label, value, pct }: { label: string; value: number; pct?: number }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center">
      <div className="text-2xl font-extrabold text-kiwi-700">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {pct !== undefined && <div className="mt-1 text-[11px] text-emerald-600">{pct.toFixed(1)}% →</div>}
    </div>
  );
}

export default async function SupplierAnalyticsPage() {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/analytics");
  const a = await supplierAnalytics(supplierId);

  return (
    <div>
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">← Dashboard</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Analytics</h1>

      <h2 className="mb-2 text-sm font-bold text-gray-700">Conversion funnel</h2>
      <div className="flex flex-wrap items-stretch gap-3">
        <FunnelStep label="Product views" value={a.funnel.views} />
        <FunnelStep label="Inquiries" value={a.funnel.inquiries} pct={a.funnel.viewToInquiryPct} />
        <FunnelStep label="Orders" value={a.funnel.orders} pct={a.funnel.inquiryToOrderPct} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-bold">Top products</h2>
          {a.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No products yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-1">Product</th>
                  <th className="py-1">Views</th>
                  <th className="py-1">Inquiries</th>
                  <th className="py-1">Orders</th>
                  <th className="py-1">Rating</th>
                </tr>
              </thead>
              <tbody>
                {a.topProducts.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="py-1">{p.name}</td>
                    <td className="py-1">{p.viewCount}</td>
                    <td className="py-1">{p.inquiryCount}</td>
                    <td className="py-1">{p.orderCount}</td>
                    <td className="py-1">{p.ratingCount > 0 ? <Stars value={p.ratingAvg} className="text-[11px]" /> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-bold">City-wise demand (orders)</h2>
          {a.cityDemand.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {a.cityDemand.map(([city, count]) => (
                <li key={city} className="flex justify-between border-b border-gray-100 pb-1">
                  <span>{city}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
