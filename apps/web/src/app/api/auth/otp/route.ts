import { NextResponse } from "next/server";
import { devOtpFor } from "@/server/services/account";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone ?? "").trim();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  // In production this would send a real SMS via MSG91/WhatsApp; in dev we return it.
  return NextResponse.json({ sent: true, devOtp: devOtpFor(phone) });
}
