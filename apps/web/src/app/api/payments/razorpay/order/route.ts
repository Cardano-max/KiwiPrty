import { NextResponse } from "next/server";
import { customerIdFromRequest } from "@/server/api-auth";
import { getCartView } from "@/server/services/cart";
import { createRazorpayOrder } from "@/server/integrations/razorpay";
import { isConfigured, config } from "@/server/config";
import { prisma } from "@/server/db";

// Creates a Razorpay order for the buyer's current cart total, for the client
// Razorpay Checkout widget. Returns { mock: true } when Razorpay isn't configured.
export async function POST(req: Request) {
  const customerId = await customerIdFromRequest(req);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { split } = await getCartView(customerId);
  if (split.totalPaise <= 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  if (!isConfigured.razorpay()) {
    return NextResponse.json({ mock: true, amountPaise: split.totalPaise });
  }

  try {
    const order = await createRazorpayOrder(split.totalPaise, `cart_${customerId}_${Date.now()}`);
    if (!order) return NextResponse.json({ error: "Razorpay order failed" }, { status: 502 });
    await prisma.payment.create({
      data: {
        purpose: "order",
        referenceId: `cart:${customerId}`,
        amountPaise: split.totalPaise,
        status: "created",
        provider: "razorpay",
        providerOrderId: order.id,
      },
    });
    return NextResponse.json({ orderId: order.id, amountPaise: split.totalPaise, keyId: config.razorpay.keyId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 502 });
  }
}
