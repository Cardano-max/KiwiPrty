import { NextResponse } from "next/server";
import { supplierIdFromRequest } from "@/server/api-auth";
import { listSupplierProducts } from "@/server/services/suppliers";

export async function GET(req: Request) {
  const supplierId = await supplierIdFromRequest(req);
  if (!supplierId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await listSupplierProducts(supplierId);
  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      pricePaise: p.basePricePaise,
      unitLabel: p.unitLabel,
      moq: p.moq,
      stock: p.stockQuantity,
      views: p.viewCount,
      status: p.status,
      image: p.images[0]?.url ?? null,
    })),
  });
}
