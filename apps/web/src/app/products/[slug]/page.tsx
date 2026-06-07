import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/services/catalog";
import { formatPaise } from "@/domain/money";
import { TagList, SubmitButton, Badge } from "@/components/ui";
import { addToCartAction, inquiryAction } from "@/server/actions";
import { parseList } from "@/server/mappers";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; inquiry?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stockQuantity > 0 && product.status === "active";
  const badges = parseList(product.supplier.verifiedBadges);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Media */}
      <div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🎁</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="mb-2">
          <TagList tags={product.tags} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="mt-1 text-sm text-gray-500">{product.category.name}</div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-kiwi-700">
            {formatPaise(product.basePricePaise)}
          </span>
          <span className="text-gray-500">/ {product.unitLabel}</span>
          <span className="ml-2 text-xs text-gray-400">+{product.gstPercent}% GST</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div>MOQ: <b>{product.moq} {product.unitLabel}</b></div>
          <div>Order multiples of: <b>{product.quantityMultiple}</b></div>
          <div>Stock: <b>{inStock ? product.stockQuantity : "Out of stock"}</b></div>
          <div>Delivery: <b>{product.deliveryTimeDays} days</b></div>
          {product.serviceCity && <div>Ships from: <b>{product.serviceCity}</b></div>}
          {product.color && <div>Colour: <b>{product.color}</b></div>}
          {product.material && <div>Material: <b>{product.material}</b></div>}
        </div>

        {product.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
        )}

        {/* Price slabs */}
        {product.priceSlabs.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Quantity price slabs</h3>
            <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {product.priceSlabs.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      {s.minQty}
                      {s.maxQty ? `–${s.maxQty}` : "+"} {product.unitLabel}
                    </td>
                    <td className="px-3 py-2 font-semibold">{formatPaise(s.unitPricePaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages */}
        {sp.error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
        )}
        {sp.inquiry && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Inquiry sent to the supplier. They&apos;ll get back to you with the best price.
          </div>
        )}

        {/* Add to cart */}
        {inStock && (
          <form action={addToCartAction} className="mt-5 flex items-end gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <div>
              <label className="block text-xs font-medium text-gray-500">Quantity</label>
              <input
                name="quantity"
                type="number"
                min={product.moq}
                step={product.quantityMultiple}
                defaultValue={product.moq}
                className="mt-1 w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
              />
            </div>
            <SubmitButton>Add to cart</SubmitButton>
          </form>
        )}

        {/* Supplier */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/suppliers/${product.supplier.id}`}
                className="font-semibold text-gray-900 hover:underline"
              >
                {product.supplier.companyName}
              </Link>
              <div className="text-xs text-gray-500">
                {product.supplier.city} · {product.supplier.businessType}
              </div>
            </div>
            <div className="flex gap-1">
              {badges.map((b) => (
                <Badge key={b} tone="green">
                  {b === "gst_verified" ? "GST ✓" : b}
                </Badge>
              ))}
            </div>
          </div>

          <form action={inquiryAction} className="mt-3">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <label className="block text-xs font-medium text-gray-500">Ask for best price</label>
            <textarea
              name="message"
              required
              rows={2}
              defaultValue={`Hi, please share your best price and MOQ for "${product.name}".`}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
            />
            <div className="mt-2">
              <SubmitButton variant="outline">Get best price</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
