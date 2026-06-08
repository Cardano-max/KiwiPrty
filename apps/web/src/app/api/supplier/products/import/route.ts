import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { bulkImportProducts } from "@/server/services/import";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "supplier") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sp = await prisma.supplierProfile.findUnique({ where: { userId: s.userId } });
  if (!sp) return NextResponse.json({ error: "Supplier not found" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const csv = String(body.csv ?? "");
  if (!csv.trim()) return NextResponse.json({ error: "csv required" }, { status: 400 });

  const result = await bulkImportProducts(sp.id, csv);
  return NextResponse.json(result);
}
