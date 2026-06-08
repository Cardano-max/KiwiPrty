"use client";

import { useState } from "react";

interface Detail {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  unitLabel: string;
  moq: number;
  quantityMultiple: number;
  gstPercent: number;
  stock: number;
  city: string | null;
  material: string | null;
  color: string | null;
  category: string;
  images: string[];
  supplier: { name: string; city: string | null };
}

const inr = (p: number) => `₹${Math.round(p / 100).toLocaleString("en-IN")}`;

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<Detail[]>([]);

  async function search() {
    if (!query.trim()) return;
    const r = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
    const d = await r.json();
    setResults((d.items ?? []).slice(0, 6));
  }

  async function add(slug: string) {
    if (selected.find((s) => s.slug === slug) || selected.length >= 3) return;
    const r = await fetch(`/api/products/${slug}`);
    const d = await r.json();
    setSelected((s) => [...s, d]);
    setResults([]);
    setQuery("");
  }

  const remove = (slug: string) => setSelected((s) => s.filter((x) => x.slug !== slug));

  const rows: { label: string; get: (d: Detail) => string }[] = [
    { label: "Price", get: (d) => `${inr(d.pricePaise)} / ${d.unitLabel}` },
    { label: "MOQ", get: (d) => `${d.moq} ${d.unitLabel}` },
    { label: "Order multiples", get: (d) => String(d.quantityMultiple) },
    { label: "GST", get: (d) => `${d.gstPercent}%` },
    { label: "Stock", get: (d) => (d.stock > 0 ? String(d.stock) : "Out of stock") },
    { label: "Category", get: (d) => d.category },
    { label: "Material", get: (d) => d.material || "—" },
    { label: "Colour", get: (d) => d.color || "—" },
    { label: "City", get: (d) => d.city || "—" },
    { label: "Supplier", get: (d) => d.supplier.name },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Compare products</h1>
      <p className="mb-4 text-sm text-gray-500">Add up to 3 products to compare side by side.</p>

      {selected.length < 3 && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search a product to add…"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-kiwi-400"
            />
            <button onClick={search} className="rounded-lg bg-kiwi-600 px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 rounded-lg border border-gray-200 bg-white">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => add(r.slug)}
                  className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-gray-50"
                >
                  <span>{r.name}</span>
                  <span className="text-kiwi-700">{inr(r.pricePaise)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Search and add products to compare.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white text-sm">
            <thead>
              <tr>
                <th className="bg-gray-50 p-3 text-left"></th>
                {selected.map((d) => (
                  <th key={d.slug} className="border-l border-gray-100 p-3 text-left align-top">
                    {d.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.images[0]} alt={d.name} className="mb-2 h-20 w-full rounded object-cover" />
                    )}
                    <div className="font-semibold">{d.name}</div>
                    <button onClick={() => remove(d.slug)} className="mt-1 text-xs text-red-500 hover:underline">
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-gray-100">
                  <td className="bg-gray-50 p-3 font-medium text-gray-600">{row.label}</td>
                  {selected.map((d) => (
                    <td key={d.slug} className="border-l border-gray-100 p-3">
                      {row.get(d)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
