import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, recordStoryView } from "@/server/services/stories";
import { getCustomerId } from "@/server/session";
import { formatPaise } from "@/domain/money";
import { Badge, SubmitButton } from "@/components/ui";
import { addToCartAction, storyInquiryAction } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function StoryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inquiry?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const story = await getStory(id);
  if (!story) notFound();

  const customerId = await getCustomerId();
  if (customerId) await recordStoryView(story.id, customerId);

  const product = story.linkedProduct;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.mediaUrl} alt={story.caption ?? "story"} className="h-full max-h-[70vh] w-full object-contain" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{story.supplier.companyName}</span>
          <Badge tone="green">{story.supplier.city}</Badge>
        </div>
        <div className="mt-1 flex gap-1">
          <Badge tone="gray">{story.type}</Badge>
          {story.offerText && <Badge tone="amber">{story.offerText}</Badge>}
          {story.isHighlight && <Badge tone="kiwi">Highlight</Badge>}
        </div>

        {story.caption && <p className="mt-3 text-gray-700">{story.caption}</p>}
        <p className="mt-1 text-xs text-gray-400">
          {story.viewCount} view{story.viewCount === 1 ? "" : "s"}
        </p>

        {sp.error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>}
        {sp.inquiry && (
          <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Inquiry sent to {story.supplier.companyName}.
          </div>
        )}

        {product ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {product.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0].url} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
              )}
              <div>
                <Link href={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:underline">
                  {product.name}
                </Link>
                <div className="text-kiwi-700">
                  {formatPaise(product.basePricePaise)} <span className="text-xs text-gray-500">/ {product.unitLabel}</span>
                </div>
                <div className="text-xs text-gray-500">MOQ {product.moq}</div>
              </div>
            </div>

            {product.status === "active" && product.stockQuantity > 0 && (
              <form action={addToCartAction} className="mt-3 flex items-end gap-2">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                <input type="hidden" name="quantity" value={product.moq} />
                <SubmitButton>Add to cart ({product.moq})</SubmitButton>
                <Link href={`/products/${product.slug}`} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                  View product
                </Link>
              </form>
            )}

            <form action={storyInquiryAction} className="mt-3">
              <input type="hidden" name="storyId" value={story.id} />
              <input type="hidden" name="productId" value={product.id} />
              <textarea
                name="message"
                required
                rows={2}
                defaultValue={`Hi, saw your story for "${product.name}". Please share best price.`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
              />
              <div className="mt-2">
                <SubmitButton variant="outline">Get best price</SubmitButton>
              </div>
            </form>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No product linked to this story.</p>
        )}

        <Link href="/stories" className="mt-4 inline-block text-sm text-kiwi-600 hover:underline">
          ← Back to stories
        </Link>
      </div>
    </div>
  );
}
