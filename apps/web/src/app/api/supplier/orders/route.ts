import { NextResponse } from "next/server";
import { supplierIdFromRequest } from "@/server/api-auth";
import { listSupplierOrders, setSupplierOrderStatus } from "@/server/services/orders";

export async function GET(req: Request) {
  const supplierId = await supplierIdFromRequest(req);
  if (!supplierId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await listSupplierOrders(supplierId);
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      shop: o.order.customer.shopName,
      status: o.status,
      totalPaise: o.totalPaise,
      invoice: o.invoice?.number ?? null,
      items: o.items.map((i) => ({ name: i.productName, qty: i.quantity })),
    })),
  });
}

export async function POST(req: Request) {
  const supplierId = await supplierIdFromRequest(req);
  if (!supplierId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    await setSupplierOrderStatus(String(body.supplierOrderId), supplierId, String(body.status));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
