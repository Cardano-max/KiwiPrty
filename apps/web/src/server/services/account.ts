import { prisma } from "@/server/db";
import { signToken, type Role } from "@/server/auth";
import { config, isConfigured } from "@/server/config";
import { sendOtpSms } from "@/server/integrations/sms";

function genOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Request an OTP. With an SMS provider configured, generate + store a random
 * code and send it; in dev (no provider) return the fixed DEV_OTP so login works.
 */
export async function requestOtp(phone: string): Promise<{ sent: boolean; devOtp?: string }> {
  if (!phone) throw new Error("Phone number is required");
  if (isConfigured.sms()) {
    const code = genOtp();
    await prisma.otpCode.create({
      data: { phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    });
    const r = await sendOtpSms(phone, code);
    return { sent: r.sent };
  }
  return { sent: false, devOtp: config.devOtp };
}

/** Back-compat helper used by the OTP API route. */
export function devOtpFor(_phone: string): string {
  return config.devOtp;
}

export async function loginWithOtp(phone: string, otp: string) {
  if (isConfigured.sms()) {
    const rec = await prisma.otpCode.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!rec || rec.code !== otp) throw new Error("Invalid or expired OTP");
    await prisma.otpCode.update({ where: { id: rec.id }, data: { consumed: true } });
  } else if (config.devOtp !== "0" && otp !== config.devOtp) {
    throw new Error("Invalid OTP");
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: { supplier: true, customer: true },
  });
  if (!user) throw new Error("No account for this number — please register.");
  if (user.status !== "active") throw new Error("Account is suspended");
  const token = await signToken({ userId: user.id, role: user.role as Role });
  return { user, token };
}

export interface RegisterCustomerInput {
  phone: string;
  shopName: string;
  ownerName?: string;
  city?: string;
  state?: string;
  businessCategory?: string;
  gstNumber?: string;
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new Error("An account with this number already exists");
  const user = await prisma.user.create({
    data: {
      phone: input.phone,
      name: input.ownerName ?? input.shopName,
      role: "customer",
      customer: {
        create: {
          shopName: input.shopName,
          ownerName: input.ownerName,
          city: input.city,
          state: input.state,
          businessCategory: input.businessCategory ?? "party_shop",
          gstNumber: input.gstNumber,
          kycStatus: "submitted",
        },
      },
    },
    include: { customer: true },
  });
  const token = await signToken({ userId: user.id, role: "customer" });
  return { user, token };
}

export interface RegisterSupplierInput {
  phone: string;
  companyName: string;
  businessType?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
}

export async function registerSupplier(input: RegisterSupplierInput) {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new Error("An account with this number already exists");
  const user = await prisma.user.create({
    data: {
      phone: input.phone,
      name: input.companyName,
      role: "supplier",
      supplier: {
        create: {
          companyName: input.companyName,
          businessType: input.businessType ?? "wholesaler",
          city: input.city,
          state: input.state,
          gstNumber: input.gstNumber,
          mobiles: JSON.stringify([input.phone]),
          kycStatus: "submitted",
        },
      },
    },
    include: { supplier: true },
  });
  const token = await signToken({ userId: user.id, role: "supplier" });
  return { user, token };
}

export async function getMe(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { supplier: true, customer: true },
  });
}
