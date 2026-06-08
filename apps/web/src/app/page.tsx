import Link from "next/link";
import { listCategories, searchProducts } from "@/server/services/catalog";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-kiwi-600 hover:underline">
          View all →
        </Link>
      </div>
      {children}
    </section>
  );
}

export default async function Home() {
  const [categories, trending, newArrivals, clearance] = await Promise.all([
    listCategories(),
    searchProducts({ sort: "popular", pageSize: 8 }),
    searchProducts({ tag: "new_arrival", pageSize: 4 }),
    searchProducts({ tag: "clearance", pageSize: 4 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-kiwi-600 to-party-pink p-8 text-white sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
          India&apos;s AI Party Supplies Marketplace
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Source party supplies from verified suppliers — search, compare &amp; order.
        </h1>
        <p className="mt-3 max-w-xl text-white/85">
          Balloons, decorations, birthday &amp; baby-shower kits, return gifts and more — directly
          from manufacturers, importers and wholesalers across India.
        </p>
        <form action="/products" className="mt-6 flex max-w-lg gap-2">
          <input
            name="q"
            placeholder="Try “baby shower decoration” or “balloons”"
            className="flex-1 rounded-lg px-4 py-3 text-gray-900 outline-none"
          />
          <button className="rounded-lg bg-white px-5 py-3 font-semibold text-kiwi-700 hover:bg-gray-100">
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-center text-xs font-medium text-gray-700 transition hover:border-kiwi-300 hover:shadow-sm"
            >
              <span className="text-2xl">{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <Section title="Trending Party Products" href="/products?sort=popular">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {newArrivals.items.length > 0 && (
        <Section title="New Arrivals" href="/products?tag=new_arrival">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {clearance.items.length > 0 && (
        <Section title="Dead Stock Clearance" href="/products?tag=clearance">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {clearance.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
