import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const [suppliers, products] = await Promise.all([
    prisma.supplierProfile.count({ where: { kycStatus: "approved" } }),
    prisma.product.count({ where: { status: "active" } }),
  ]);
  return NextResponse.json({ status: "ok", suppliers, products, time: new Date().toISOString() });
}
