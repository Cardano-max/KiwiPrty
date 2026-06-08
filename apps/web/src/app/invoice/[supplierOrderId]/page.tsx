import { notFound, redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { getInvoiceForRequester } from "@/server/services/invoices";
import { formatPaise } from "@/domain/money";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ supplierOrderId: string }>;
}) {
  const { supplierOrderId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/invoice/${supplierOrderId}`);

  const so = await getInvoiceForRequester(supplierOrderId, session);
  if (!so || !so.invoice) notFound();

  const buyer = so.order.customer;
  const billing = buyer.addresses.find((a) => a.type === "billing") ?? buyer.addresses[0];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <a href="javascript:history.back()" className="no-print text-sm text-kiwi-600 hover:underline">
          ← Back
        </a>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-xl font-extrabold text-kiwi-700">Tax Invoice</div>
            <div className="text-sm text-gray-500">Invoice no: {so.invoice.number}</div>
            <div className="text-sm text-gray-500">
              Date: {new Date(so.invoice.issuedAt).toLocaleDateString("en-IN")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">🎈 Kiwi Party</div>
            <div className="text-xs text-gray-400">via Kiwi Party Marketplace</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-4 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Sold by (Supplier)</div>
            <div className="mt-1 text-gray-900">{so.supplier.companyName}</div>
            <div className="text-gray-500">{so.supplier.city}{so.supplier.state ? `, ${so.supplier.state}` : ""}</div>
            {so.supplier.gstNumber && <div className="text-gray-500">GSTIN: {so.supplier.gstNumber}</div>}
            <div className="text-gray-400 capitalize">{so.supplier.businessType}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Billed to (Buyer)</div>
            <div className="mt-1 text-gray-900">{buyer.shopName}</div>
            {billing && (
              <div className="text-gray-500">
                {billing.line1}
                {billing.line2 ? `, ${billing.line2}` : ""}, {billing.city}, {billing.state} {billing.pincode}
              </div>
            )}
            {buyer.gstNumber && <div className="text-gray-500">GSTIN: {buyer.gstNumber}</div>}
          </div>
        </div>

        <table className="w-full border-t border-gray-200 text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">GST</th>
              <th className="py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {so.items.map((it) => {
              const sub = it.unitPricePaise * it.quantity;
              const gst = it.lineTotalPaise - sub;
              return (
                <tr key={it.id} className="border-t border-gray-100">
                  <td className="py-2">{it.productName}</td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">{formatPaise(it.unitPricePaise)}</td>
                  <td className="py-2 text-right">
                    {formatPaise(gst)} ({it.gstPercent}%)
                  </td>
                  <td className="py-2 text-right">{formatPaise(it.lineTotalPaise)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-64 text-sm">
          <Row label="Subtotal" value={formatPaise(so.subtotalPaise)} />
          <Row label="GST" value={formatPaise(so.gstPaise)} />
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-kiwi-700">{formatPaise(so.totalPaise)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-400">
          This is a computer-generated tax invoice. Payment status: {so.order.paymentStatus}. Generated
          via Kiwi Party — Search Smart, Sell Smart, Grow Smart.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
