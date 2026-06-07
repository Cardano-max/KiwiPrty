import { NextResponse } from "next/server";
import { generateProductDescription } from "@/server/ai";
import { getSession } from "@/server/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "supplier") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const result = await generateProductDescription({
    name: String(body.name || "Product"),
    category: body.category ? String(body.category) : undefined,
    material: body.material ? String(body.material) : undefined,
    color: body.color ? String(body.color) : undefined,
    unitLabel: body.unitLabel ? String(body.unitLabel) : undefined,
  });
  return NextResponse.json(result);
}
