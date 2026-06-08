import Link from "next/link";
import { getCustomerId } from "@/server/session";
import { listCustomerOrders } from "@/server/services/orders";
import { formatPaise } from "@/domain/money";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const customerId = await getCustomerId();
  if (!customerId) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Your orders</h1>
        <p className="mt-2 text-gray-600">Please log in as a buyer to see your orders.</p>
        <Link href="/login?next=/orders" className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white">
          Login
        </Link>
      </div>
    );
  }

  const orders = await listCustomerOrders(customerId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your orders</h1>
        <div className="flex gap-3 text-sm font-semibold text-kiwi-600">
          <Link href="/bookings" className="hover:underline">Bookings</Link>
          <Link href="/reports" className="hover:underline">Report →</Link>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No orders yet. <Link href="/products" className="text-kiwi-600 hover:underline">Browse products</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm"
            >
              <div>
                <div className="font-semibold">Order #{o.id.slice(-6).toUpperCase()}</div>
                <div className="text-xs text-gray-500">
                  {new Date(o.placedAt).toLocaleDateString("en-IN")} ·{" "}
                  {o.supplierOrders.length} supplier order{o.supplierOrders.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-kiwi-700">{formatPaise(o.totalPaise)}</div>
                <div className="text-xs capitalize text-emerald-600">{o.paymentStatus}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
