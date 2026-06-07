import { prisma } from "@/server/db";
import { signToken, type Role } from "@/server/auth";

const DEV_OTP = process.env.DEV_OTP ?? "123456";

/** Dev OTP: returned to the client so login works without a real SMS provider. */
export function devOtpFor(_phone: string): string {
  return DEV_OTP;
}

export async function loginWithOtp(phone: string, otp: string) {
  if (DEV_OTP !== "0" && otp !== DEV_OTP) throw new Error("Invalid OTP");
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
