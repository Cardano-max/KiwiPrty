import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerId } from "@/server/session";
import { getOrder } from "@/server/services/orders";
import { formatPaise } from "@/domain/money";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const customerId = await getCustomerId();
  if (!customerId) {
    return (
      <div className="text-center">
        <Link href={`/login?next=/orders/${id}`} className="text-kiwi-600">Login to view this order</Link>
      </div>
    );
  }
  const order = await getOrder(id, customerId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {sp.placed && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700">
          🎉 Order placed! Your order was split into {order.supplierOrders.length} supplier order
          {order.supplierOrders.length === 1 ? "" : "s"}, each with its own GST invoice.
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <div className="text-sm text-gray-500">
            {new Date(order.placedAt).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-kiwi-700">{formatPaise(order.totalPaise)}</div>
          <Badge tone="green">Payment {order.paymentStatus}</Badge>
        </div>
      </div>

      {order.supplierOrders.map((so) => (
        <div key={so.id} className="mb-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <div className="font-semibold">🏭 {so.supplier.companyName}</div>
            <div className="flex items-center gap-2">
              <Badge tone="kiwi">{so.status}</Badge>
              {so.invoice && (
                <Link href={`/invoice/${so.id}`} className="text-xs font-semibold text-kiwi-600 hover:underline">
                  Invoice {so.invoice.number} →
                </Link>
              )}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {so.items.map((it) => (
                <tr key={it.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{it.productName}</td>
                  <td className="px-4 py-2">{it.quantity}</td>
                  <td className="px-4 py-2">{formatPaise(it.unitPricePaise)}</td>
                  <td className="px-4 py-2 text-right">{formatPaise(it.lineTotalPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-2 text-right text-sm">
            <span className="text-gray-500">
              Subtotal {formatPaise(so.subtotalPaise)} · GST {formatPaise(so.gstPaise)} ·{" "}
            </span>
            <b>Total {formatPaise(so.totalPaise)}</b>
          </div>
        </div>
      ))}

      <Link href="/orders" className="text-sm text-kiwi-600 hover:underline">
        ← Back to orders
      </Link>
    </div>
  );
}
