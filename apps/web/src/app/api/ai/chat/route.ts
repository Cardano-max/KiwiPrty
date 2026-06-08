import { NextResponse } from "next/server";
import { searchProducts, listCategories, getCities } from "@/server/services/catalog";
import { assistantReply, parseSearchQuery } from "@/server/ai";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  // Reuse the AI search parser so the assistant finds products even in fallback mode.
  const [categories, cities] = await Promise.all([listCategories(), getCities()]);
  const parsed = await parseSearchQuery(
    message,
    categories.map((c) => ({ name: c.name, slug: c.slug })),
    cities,
  );
  const res = await searchProducts({
    q: parsed.terms || undefined,
    categorySlug: parsed.categorySlug,
    city: parsed.city,
    tag: parsed.tag,
    priceMaxPaise: parsed.priceMaxPaise,
    pageSize: 5,
  });

  const products = res.items.map((p) => ({
    name: p.name,
    slug: p.slug,
    pricePaise: p.basePricePaise,
    unitLabel: p.unitLabel,
    supplier: p.supplier.companyName,
  }));

  const reply = await assistantReply(message, products);
  return NextResponse.json({ ...reply, products });
}
