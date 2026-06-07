import { NextResponse } from "next/server";
import { customerIdFromRequest } from "@/server/api-auth";
import { listCustomerOrders } from "@/server/services/orders";

export async function GET(req: Request) {
  const customerId = await customerIdFromRequest(req);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await listCustomerOrders(customerId);
  return NextResponse.json({ orders });
}
