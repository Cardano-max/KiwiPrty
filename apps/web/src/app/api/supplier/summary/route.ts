import { NextResponse } from "next/server";
import { supplierIdFromRequest } from "@/server/api-auth";
import { getSupplierDashboard } from "@/server/services/suppliers";

export async function GET(req: Request) {
  const supplierId = await supplierIdFromRequest(req);
  if (!supplierId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const d = await getSupplierDashboard(supplierId);
  return NextResponse.json({
    stats: d.stats,
    recentOrders: d.recentOrders.map((o) => ({
      id: o.id,
      shop: o.order.customer.shopName,
      items: o.items.length,
      status: o.status,
      totalPaise: o.totalPaise,
    })),
    recentInquiries: d.recentInquiries.map((i) => ({
      id: i.id,
      shop: i.customer.shopName,
      product: i.product.name,
      message: i.message,
      score: i.score,
    })),
  });
}
