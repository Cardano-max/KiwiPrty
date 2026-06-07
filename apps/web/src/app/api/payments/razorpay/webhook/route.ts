import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/server/integrations/razorpay";
import { prisma } from "@/server/db";

// Razorpay posts payment events here. Verifies the signature against the raw
// body, then marks the matching Payment paid. Configure RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const entity = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && entity?.order_id) {
    await prisma.payment.updateMany({
      where: { providerOrderId: entity.order_id },
      data: { status: "paid", providerPaymentId: entity.id },
    });
  }
  return NextResponse.json({ ok: true });
}
