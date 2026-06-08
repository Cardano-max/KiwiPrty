import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { getSupplierStories } from "@/server/services/stories";
import { listSupplierProducts } from "@/server/services/suppliers";
import { createStoryAction } from "@/server/actions";
import { SubmitButton, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SupplierStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/stories");

  const [stories, products] = await Promise.all([
    getSupplierStories(supplierId),
    listSupplierProducts(supplierId),
  ]);

  return (
    <div>
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">← Dashboard</Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold">Supplier Stories</h1>
      <p className="mb-4 text-sm text-gray-500">
        Post visual stories (24h, or pin as a highlight). Buyers can view and order directly — and you
        see views &amp; leads per story.
      </p>

      {sp.created && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Story posted.</div>
      )}
      {sp.error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create */}
        <div className="lg:col-span-1">
          <form action={createStoryAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-bold">Create a story</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500">Type</label>
              <select name="type" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="product">Product</option>
                <option value="offer">Offer</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Image URL *</label>
              <input name="mediaUrl" required placeholder="https://…" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Caption</label>
              <input name="caption" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Link a product</label>
              <select name="linkedProductId" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">— none —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Offer text</label>
              <input name="offerText" placeholder="e.g. 15% off this week" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="isHighlight" /> Pin as highlight (no 24h expiry)
            </label>
            <SubmitButton className="w-full">Post story</SubmitButton>
          </form>
        </div>

        {/* List + analytics */}
        <div className="lg:col-span-2">
          {stories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              No stories yet. Post your first one!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stories.map((s) => {
                const expired = !s.isHighlight && s.expiresAt < new Date();
                return (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.mediaUrl} alt={s.caption ?? "story"} className="h-full w-full object-cover" />
                      <div className="absolute left-2 top-2 flex gap-1">
                        {s.isHighlight && <Badge tone="kiwi">Highlight</Badge>}
                        {expired && <Badge tone="gray">Expired</Badge>}
                      </div>
                    </div>
                    <div className="p-2 text-xs">
                      <div className="line-clamp-1 font-medium">{s.caption ?? s.type}</div>
                      {s.linkedProduct && (
                        <div className="line-clamp-1 text-gray-500">{s.linkedProduct.name}</div>
                      )}
                      <div className="mt-1 flex justify-between text-gray-600">
                        <span>👁 {s._count.views} views</span>
                        <span>💬 {s._count.inquiries} leads</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
