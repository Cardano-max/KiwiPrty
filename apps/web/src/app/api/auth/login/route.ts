import { NextResponse } from "next/server";
import { loginWithOtp } from "@/server/services/account";
import { setSessionCookie } from "@/server/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone ?? "").trim();
  const otp = String(body.otp ?? "").trim();
  try {
    const { user, token } = await loginWithOtp(phone, otp);
    await setSessionCookie(token);
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, phone: user.phone },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Login failed" },
      { status: 401 },
    );
  }
}
