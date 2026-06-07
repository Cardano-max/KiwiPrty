import Link from "next/link";
import { listStoriesFeed } from "@/server/services/stories";
import { formatPaise } from "@/domain/money";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await listStoriesFeed();

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Supplier Stories</h1>
        <p className="text-sm text-gray-500">
          New arrivals, offers and warehouse drops from verified suppliers — tap to view and order.
        </p>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No active stories right now.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.id}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.mediaUrl} alt={s.caption ?? "story"} className="h-full w-full object-cover transition group-hover:scale-105" />
                <div className="absolute left-2 top-2 flex gap-1">
                  {s.offerText && <Badge tone="amber">Offer</Badge>}
                  {s.isHighlight && <Badge tone="kiwi">Highlight</Badge>}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="text-xs font-semibold text-white">{s.supplier.companyName}</div>
                  {s.caption && <div className="line-clamp-1 text-[11px] text-white/80">{s.caption}</div>}
                </div>
              </div>
              {s.linkedProduct && (
                <div className="p-2 text-xs">
                  <div className="line-clamp-1 font-medium text-gray-800">{s.linkedProduct.name}</div>
                  <div className="font-bold text-kiwi-700">{formatPaise(s.linkedProduct.basePricePaise)}</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
