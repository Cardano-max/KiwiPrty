import Link from "next/link";
import { getCustomerId } from "@/server/session";
import { getCartView } from "@/server/services/cart";
import { computeLine } from "@/domain/pricing";
import { toPricing } from "@/server/mappers";
import { formatPaise } from "@/domain/money";
import { SubmitButton } from "@/components/ui";
import { updateCartAction, removeCartAction, checkoutAction } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const customerId = await getCustomerId();

  if (!customerId) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Your cart</h1>
        <p className="mt-2 text-gray-600">Please log in as a buyer to view your cart and order.</p>
        <Link href="/login?next=/cart" className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white">
          Login
        </Link>
      </div>
    );
  }

  const { items, split } = await getCartView(customerId);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Browse the marketplace and add products to order.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  // group items by supplier
  const groups = new Map<string, { name: string; items: typeof items }>();
  for (const it of items) {
    const g = groups.get(it.product.supplierId) ?? { name: it.product.supplier.companyName, items: [] };
    g.items.push(it);
    groups.set(it.product.supplierId, g);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
        {sp.error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
        )}

        {[...groups.entries()].map(([supplierId, group]) => {
          const so = split.supplierOrders.find((s) => s.supplierId === supplierId);
          return (
            <div key={supplierId} className="mb-5 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                <span>🏭 {group.name}</span>
                <span className="text-xs font-normal text-gray-500">
                  Separate order &amp; GST invoice
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {group.items.map((it) => {
                  const line = computeLine(toPricing(it.product), it.quantity);
                  return (
                    <div key={it.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {it.product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.product.images[0].url} alt={it.product.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{it.product.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatPaise(line.unitPricePaise)} / {it.product.unitLabel} · +{it.product.gstPercent}% GST
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <form action={updateCartAction} className="flex items-center gap-1">
                            <input type="hidden" name="productId" value={it.productId} />
                            <input
                              name="quantity"
                              type="number"
                              min={it.product.moq}
                              step={it.product.quantityMultiple}
                              defaultValue={it.quantity}
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                            <button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
                              Update
                            </button>
                          </form>
                          <form action={removeCartAction}>
                            <input type="hidden" name="productId" value={it.productId} />
                            <button className="text-xs text-red-500 hover:underline">Remove</button>
                          </form>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatPaise(line.totalPaise)}</div>
                        <div className="text-xs text-gray-400">incl. GST</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {so && (
                <div className="border-t border-gray-100 px-4 py-2 text-right text-sm text-gray-600">
                  Supplier total: <b className="text-gray-900">{formatPaise(so.totalPaise)}</b>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div>
        <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPaise(split.subtotalPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST</span>
              <span>{formatPaise(split.gstPaise)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-kiwi-700">{formatPaise(split.totalPaise)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {split.supplierOrders.length} supplier order
            {split.supplierOrders.length === 1 ? "" : "s"} · one GST invoice each
          </p>
          <form action={checkoutAction} className="mt-4">
            <SubmitButton className="w-full">Place order &amp; pay</SubmitButton>
          </form>
          <p className="mt-2 text-center text-xs text-gray-400">Payment is mocked in this demo build</p>
        </div>
      </div>
    </div>
  );
}
