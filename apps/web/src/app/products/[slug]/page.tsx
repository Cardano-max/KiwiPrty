import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductMeta } from "@/server/services/catalog";
import { getCustomerId } from "@/server/session";
import { listProductReviews, getCustomerReview, hasPurchased } from "@/server/services/reviews";
import { isFavorited } from "@/server/services/favorites";
import { formatPaise } from "@/domain/money";
import { TagList, SubmitButton, Badge, Stars } from "@/components/ui";
import { addToCartAction, inquiryAction, createReviewAction, toggleFavoriteAction } from "@/server/actions";
import { parseList } from "@/server/mappers";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductMeta(slug);
  if (!p) return { title: "Product not found — Kiwi Party" };
  const title = `${p.name} — wholesale ${p.category.name} | Kiwi Party`;
  const description = (
    p.description ??
    `${p.name} available wholesale${p.serviceCity ? ` from ${p.serviceCity}` : ""} on Kiwi Party.`
  ).slice(0, 160);
  return { title, description, openGraph: { title, description } };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; inquiry?: string; reviewed?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stockQuantity > 0 && product.status === "active";
  const badges = parseList(product.supplier.verifiedBadges);

  const customerId = await getCustomerId();
  const [reviews, purchased, myReview, favorited] = await Promise.all([
    listProductReviews(product.id),
    customerId ? hasPurchased(customerId, product.id) : Promise.resolve(false),
    customerId ? getCustomerReview(customerId, product.id) : Promise.resolve(null),
    customerId ? isFavorited(customerId, product.id) : Promise.resolve(false),
  ]);

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
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <span>{product.category.name}</span>
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <Stars value={product.ratingAvg} className="text-xs" />
              <span>{product.ratingAvg.toFixed(1)} ({product.ratingCount})</span>
            </span>
          )}
        </div>

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
        {sp.reviewed && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Thanks — your review has been posted.
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

        <form action={toggleFavoriteAction} className="mt-3">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="redirectTo" value={`/products/${product.slug}`} />
          <button
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              favorited
                ? "border-party-pink bg-pink-50 text-party-pink"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {favorited ? "♥ Saved to wishlist" : "♡ Save to wishlist"}
          </button>
        </form>

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

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="text-lg font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-1 text-sm text-gray-500">No reviews yet.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.customer.shopName}</span>
                    <Stars value={r.rating} className="text-xs" />
                  </div>
                  {r.text && <p className="mt-1 text-sm text-gray-600">{r.text}</p>}
                </div>
              ))}
            </div>
          )}

          {purchased ? (
            <form action={createReviewAction} className="mt-4 rounded-lg border border-gray-200 p-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="slug" value={product.slug} />
              <div className="text-sm font-semibold">{myReview ? "Edit your review" : "Write a review"}</div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-gray-500">Rating</label>
                <select
                  name="rating"
                  defaultValue={myReview?.rating ?? 5}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="text"
                rows={2}
                defaultValue={myReview?.text ?? ""}
                placeholder="Share your experience…"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
              />
              <div className="mt-2">
                <SubmitButton variant="outline">{myReview ? "Update review" : "Submit review"}</SubmitButton>
              </div>
            </form>
          ) : customerId ? (
            <p className="mt-2 text-xs text-gray-400">Order this product to leave a review.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
