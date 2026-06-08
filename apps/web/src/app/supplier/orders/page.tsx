import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { listSupplierOrders } from "@/server/services/orders";
import { formatPaise } from "@/domain/money";
import { setOrderStatusAction } from "@/server/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "accepted", "packed", "dispatched", "delivered", "cancelled"];

export default async function SupplierOrdersPage() {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/orders");
  const orders = await listSupplierOrders(supplierId);

  return (
    <div>
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">← Dashboard</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{o.order.customer.shopName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString("en-IN")} ·{" "}
                    {o.invoice ? (
                      <Link href={`/invoice/${o.id}`} className="font-semibold text-kiwi-600 hover:underline">
                        Invoice {o.invoice.number}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-kiwi-700">{formatPaise(o.totalPaise)}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {o.items.map((it) => (
                  <span key={it.id} className="mr-3">
                    {it.productName} ×{it.quantity}
                  </span>
                ))}
              </div>
              <form action={setOrderStatusAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="supplierOrderId" value={o.id} />
                <select name="status" defaultValue={o.status} className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="rounded-lg border border-kiwi-300 px-3 py-1 text-sm font-semibold text-kiwi-700 hover:bg-kiwi-50">
                  Update status
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
