import { NextResponse } from "next/server";
import { customerIdFromRequest } from "@/server/api-auth";
import { checkout } from "@/server/services/orders";

export async function POST(req: Request) {
  const customerId = await customerIdFromRequest(req);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const order = await checkout(customerId);
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 400 },
    );
  }
}
