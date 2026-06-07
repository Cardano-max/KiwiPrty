import Link from "next/link";
import { searchProducts, listCategories, getCities, type ProductSort } from "@/server/services/catalog";
import { parseSearchQuery, type ParsedSearch } from "@/server/ai";
import { formatPaise } from "@/domain/money";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

interface SP {
  q?: string;
  category?: string;
  city?: string;
  tag?: string;
  sort?: string;
  page?: string;
}

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Best Match" },
  { value: "price_asc", label: "Low Price" },
  { value: "price_desc", label: "High Price" },
  { value: "new", label: "Newest" },
];

function buildQuery(base: SP, override: Partial<SP>): string {
  const merged = { ...base, ...override };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, String(v));
  }
  return `/products?${params.toString()}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [categories, cities] = await Promise.all([listCategories(), getCities()]);

  // AI search: turn a natural-language query into structured filters.
  let parsed: ParsedSearch | null = null;
  if (sp.q && sp.q.trim()) {
    parsed = await parseSearchQuery(
      sp.q,
      categories.map((c) => ({ name: c.name, slug: c.slug })),
      cities,
    );
  }

  const result = await searchProducts({
    q: parsed ? parsed.terms || undefined : sp.q,
    categorySlug: sp.category ?? parsed?.categorySlug,
    city: sp.city ?? parsed?.city,
    tag: sp.tag ?? parsed?.tag,
    priceMaxPaise: parsed?.priceMaxPaise,
    sort: (sp.sort as ProductSort) ?? "popular",
    page: Number(sp.page ?? 1),
  });

  const inferred = parsed && (parsed.priceMaxPaise || parsed.categorySlug || parsed.city || parsed.tag);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filters */}
      <aside className="lg:w-60 lg:flex-shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-gray-900">Categories</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href={buildQuery(sp, { category: undefined, page: undefined })}
                className={`block rounded px-2 py-1 hover:bg-gray-100 ${!sp.category ? "font-semibold text-kiwi-700" : "text-gray-700"}`}
              >
                All categories
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={buildQuery(sp, { category: c.slug, page: undefined })}
                  className={`block rounded px-2 py-1 hover:bg-gray-100 ${sp.category === c.slug ? "font-semibold text-kiwi-700" : "text-gray-700"}`}
                >
                  {c.icon} {c.name}
                </Link>
              </li>
            ))}
          </ul>

          {cities.length > 0 && (
            <>
              <h3 className="mb-2 mt-4 text-sm font-bold text-gray-900">City</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href={buildQuery(sp, { city: undefined, page: undefined })}
                    className={`block rounded px-2 py-1 hover:bg-gray-100 ${!sp.city ? "font-semibold text-kiwi-700" : "text-gray-700"}`}
                  >
                    All cities
                  </Link>
                </li>
                {cities.map((city) => (
                  <li key={city}>
                    <Link
                      href={buildQuery(sp, { city, page: undefined })}
                      className={`block rounded px-2 py-1 hover:bg-gray-100 ${sp.city === city ? "font-semibold text-kiwi-700" : "text-gray-700"}`}
                    >
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        {inferred && parsed && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-kiwi-50 px-3 py-2 text-xs text-kiwi-800">
            <span className="font-semibold">🤖 AI understood:</span>
            {parsed.categorySlug && (
              <Badge>{categories.find((c) => c.slug === parsed.categorySlug)?.name ?? parsed.categorySlug}</Badge>
            )}
            {parsed.priceMaxPaise && <Badge>under {formatPaise(parsed.priceMaxPaise)}</Badge>}
            {parsed.city && <Badge>{parsed.city}</Badge>}
            {parsed.tag && <Badge>{parsed.tag.replace("_", " ")}</Badge>}
            {parsed.source === "fallback" && (
              <span className="text-kiwi-400">· set ANTHROPIC_API_KEY for smarter parsing</span>
            )}
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {result.total} product{result.total === 1 ? "" : "s"}
            {sp.q ? ` for “${sp.q}”` : ""}
          </div>
          <div className="flex flex-wrap gap-1">
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={buildQuery(sp, { sort: s.value, page: undefined })}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  (sp.sort ?? "popular") === s.value
                    ? "border-kiwi-400 bg-kiwi-50 font-semibold text-kiwi-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No products found. Try a different search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {result.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {result.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((pg) => (
              <Link
                key={pg}
                href={buildQuery(sp, { page: String(pg) })}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  result.page === pg
                    ? "border-kiwi-400 bg-kiwi-50 font-semibold text-kiwi-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {pg}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
