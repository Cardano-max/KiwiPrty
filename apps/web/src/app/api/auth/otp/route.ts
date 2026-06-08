import { NextResponse } from "next/server";
import { requestOtp } from "@/server/services/account";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone ?? "").trim();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  try {
    const result = await requestOtp(phone);
    return NextResponse.json({ sent: result.sent, ...(result.devOtp ? { devOtp: result.devOtp } : {}) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
