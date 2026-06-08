import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/auth";
import { getCustomerId, getSupplierId } from "@/server/session";
import { getRfq } from "@/server/services/rfq";
import { formatPaise } from "@/domain/money";
import { SubmitButton, Badge } from "@/components/ui";
import { createQuoteAction, closeRfqAction } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function RfqDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quoted?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/rfq/${id}`);

  const rfq = await getRfq(id);
  if (!rfq) notFound();

  const customerId = await getCustomerId();
  const supplierId = await getSupplierId();
  const isOwner = !!customerId && rfq.customerId === customerId;
  const myQuote = supplierId ? rfq.quotes.find((q) => q.supplierId === supplierId) : null;
  const open = rfq.status === "open";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={supplierId ? "/rfq/board" : "/rfq"} className="text-sm text-kiwi-600 hover:underline">
        ← Back
      </Link>

      <div className="mt-2 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{rfq.title}</h1>
          <Badge tone={open ? "green" : "gray"}>{rfq.status}</Badge>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {rfq.category?.name ?? "Any category"}
          {rfq.targetQty ? ` · quantity ${rfq.targetQty}` : ""}
          {supplierId ? ` · from ${rfq.customer.shopName}${rfq.customer.city ? `, ${rfq.customer.city}` : ""}` : ""}
        </div>
        {rfq.detail ? <p className="mt-3 text-sm text-gray-700">{rfq.detail}</p> : null}
      </div>

      {sp.error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>}
      {sp.quoted && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Quote submitted.</div>
      )}

      {/* Supplier: quote form */}
      {supplierId && !isOwner && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold">{myQuote ? "Update your quote" : "Send a quote"}</h2>
          {open ? (
            <form action={createQuoteAction} className="mt-2 space-y-3">
              <input type="hidden" name="rfqId" value={rfq.id} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Price per unit (₹) *</label>
                  <input name="price" type="number" step="0.01" required defaultValue={myQuote ? myQuote.pricePaise / 100 : undefined} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">MOQ</label>
                  <input name="moq" type="number" defaultValue={myQuote?.moq ?? undefined} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <textarea name="note" rows={2} placeholder="Note (delivery time, terms…)" defaultValue={myQuote?.note ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <SubmitButton>{myQuote ? "Update quote" : "Submit quote"}</SubmitButton>
            </form>
          ) : (
            <p className="mt-2 text-sm text-gray-500">This requirement is closed.</p>
          )}
        </div>
      )}

      {/* Owner: quotes received */}
      {isOwner && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">Quotes received ({rfq.quotes.length})</h2>
            {open && (
              <form action={closeRfqAction}>
                <input type="hidden" name="rfqId" value={rfq.id} />
                <button className="text-sm text-gray-500 hover:underline">Close requirement</button>
              </form>
            )}
          </div>
          {rfq.quotes.length === 0 ? (
            <p className="text-sm text-gray-500">No quotes yet.</p>
          ) : (
            <div className="space-y-2">
              {rfq.quotes.map((q) => (
                <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/suppliers/${q.supplierId}`} className="font-semibold hover:underline">
                      {q.supplier.companyName}
                    </Link>
                    <span className="font-bold text-kiwi-700">{formatPaise(q.pricePaise)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {q.supplier.city} {q.moq ? `· MOQ ${q.moq}` : ""}
                  </div>
                  {q.note ? <p className="mt-1 text-sm text-gray-600">{q.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
