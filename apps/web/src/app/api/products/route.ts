import { NextResponse } from "next/server";
import { searchProducts, type ProductSort } from "@/server/services/catalog";
import { parseList } from "@/server/mappers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await searchProducts({
    q: url.searchParams.get("q") ?? undefined,
    categorySlug: url.searchParams.get("category") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    sort: (url.searchParams.get("sort") as ProductSort | null) ?? undefined,
    page: Number(url.searchParams.get("page") ?? 1),
  });

  return NextResponse.json({
    ...result,
    items: result.items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      pricePaise: p.basePricePaise,
      unitLabel: p.unitLabel,
      moq: p.moq,
      gstPercent: p.gstPercent,
      stock: p.stockQuantity,
      city: p.serviceCity,
      image: p.images[0]?.url ?? null,
      tags: parseList(p.tags),
      category: p.category.name,
      supplier: { id: p.supplier.id, name: p.supplier.companyName, city: p.supplier.city },
    })),
  });
}
