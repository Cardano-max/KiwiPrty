import { NextResponse } from "next/server";
import { getProductBySlug } from "@/server/services/catalog";
import { parseList } from "@/server/mappers";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    pricePaise: p.basePricePaise,
    unitLabel: p.unitLabel,
    moq: p.moq,
    quantityMultiple: p.quantityMultiple,
    gstPercent: p.gstPercent,
    stock: p.stockQuantity,
    city: p.serviceCity,
    material: p.material,
    color: p.color,
    deliveryTimeDays: p.deliveryTimeDays,
    tags: parseList(p.tags),
    images: p.images.map((i) => i.url),
    category: p.category.name,
    priceSlabs: p.priceSlabs.map((s) => ({
      minQty: s.minQty,
      maxQty: s.maxQty,
      unitPricePaise: s.unitPricePaise,
    })),
    supplier: {
      id: p.supplier.id,
      name: p.supplier.companyName,
      city: p.supplier.city,
      businessType: p.supplier.businessType,
      trustScore: p.supplier.trustScore,
      badges: parseList(p.supplier.verifiedBadges),
    },
  });
}
