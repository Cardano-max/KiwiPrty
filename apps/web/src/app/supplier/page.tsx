import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { getSupplierDashboard, listSupplierProducts } from "@/server/services/suppliers";
import { formatPaise } from "@/domain/money";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-2xl font-extrabold text-kiwi-700">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function SupplierDashboard({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const sp = await searchParams;
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier");

  const [dash, products] = await Promise.all([
    getSupplierDashboard(supplierId),
    listSupplierProducts(supplierId),
  ]);
  const { stats, recentOrders, recentInquiries } = dash;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/supplier/orders" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
            Orders
          </Link>
          <Link href="/supplier/stories" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
            Stories
          </Link>
          <Link href="/supplier/analytics" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
            Analytics
          </Link>
          <Link href="/supplier/products/new" className="rounded-lg bg-kiwi-600 px-3 py-2 text-sm font-semibold text-white hover:bg-kiwi-700">
            + Add product
          </Link>
        </div>
      </div>

      {sp.created && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Product added.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Products" value={String(stats.productCount)} />
        <Stat label="Orders" value={String(stats.ordersCount)} />
        <Stat label="Inquiries" value={String(stats.inquiriesCount)} />
        <Stat label="Product views" value={String(stats.totalViews)} />
        <Stat label="Sales" value={formatPaise(stats.totalSalesPaise)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-bold">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <div className="font-medium">{o.order.customer.shopName}</div>
                    <div className="text-xs text-gray-500">{o.items.length} item(s) · {o.status}</div>
                  </div>
                  <div className="font-semibold">{formatPaise(o.totalPaise)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-bold">Recent inquiries (leads)</h2>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-gray-500">No inquiries yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentInquiries.map((i) => (
                <div key={i.id} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{i.customer.shopName}</span>
                    <Badge tone={i.score === "hot" ? "amber" : i.score === "warm" ? "kiwi" : "gray"}>
                      {i.score === "hot" ? "🔥 Hot" : i.score === "warm" ? "⭐ Warm" : "⚪ Cold"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">{i.product.name}</div>
                  <div className="text-xs text-gray-600">“{i.message}”</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-bold">Your products</h2>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">
            No products yet. <Link href="/supplier/products/new" className="text-kiwi-600">Add your first product</Link>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2">Price</th>
                <th className="py-2">MOQ</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Views</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{formatPaise(p.basePricePaise)}</td>
                  <td className="py-2">{p.moq}</td>
                  <td className="py-2">{p.stockQuantity}</td>
                  <td className="py-2">{p.viewCount}</td>
                  <td className="py-2 capitalize">{p.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
