import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupplier } from "@/server/services/suppliers";
import { parseList } from "@/server/mappers";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SupplierProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicSupplier(id);
  if (!data) notFound();
  const { supplier, stats } = data;
  const badges = parseList(supplier.verifiedBadges);

  return (
    <div>
      {/* Profile header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kiwi-100 text-2xl font-bold text-kiwi-700">
            {supplier.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{supplier.companyName}</h1>
              {badges.map((b) => (
                <Badge key={b} tone="green">
                  {b === "gst_verified" ? "GST ✓" : b}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {supplier.businessType} · {supplier.city ?? "—"}, {supplier.state ?? ""} · Trust score{" "}
              {supplier.trustScore}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-kiwi-700">{stats.products}</div>
              <div className="text-xs text-gray-500">Products</div>
            </div>
            <div>
              <div className="text-xl font-bold text-kiwi-700">{stats.stories}</div>
              <div className="text-xs text-gray-500">Stories</div>
            </div>
            <div>
              <div className="text-xl font-bold text-kiwi-700">{stats.totalViews}</div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Story highlights */}
      {supplier.stories.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Stories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {supplier.stories.map((s) => (
              <Link key={s.id} href={`/stories/${s.id}`} className="w-24 flex-shrink-0">
                <div className="aspect-[3/4] overflow-hidden rounded-xl border-2 border-kiwi-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.mediaUrl} alt={s.caption ?? "story"} className="h-full w-full object-cover" />
                </div>
                <div className="mt-1 line-clamp-1 text-center text-[11px] text-gray-600">
                  {s.isHighlight ? "★ " : ""}
                  {s.caption ?? s.type}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Products</h2>
        {supplier.products.length === 0 ? (
          <p className="text-sm text-gray-500">No products listed yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {supplier.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
