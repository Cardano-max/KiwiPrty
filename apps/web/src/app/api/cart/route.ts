import { NextResponse } from "next/server";
import { customerIdFromRequest } from "@/server/api-auth";
import { getCartView, addToCart } from "@/server/services/cart";

export async function GET(req: Request) {
  const customerId = await customerIdFromRequest(req);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { items, split } = await getCartView(customerId);
  return NextResponse.json({
    items: items.map((it) => ({
      productId: it.productId,
      name: it.product.name,
      supplier: it.product.supplier.companyName,
      quantity: it.quantity,
    })),
    split,
  });
}

export async function POST(req: Request) {
  const customerId = await customerIdFromRequest(req);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    await addToCart(customerId, String(body.productId), Number(body.quantity));
    const { split } = await getCartView(customerId);
    return NextResponse.json({ ok: true, split });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}
