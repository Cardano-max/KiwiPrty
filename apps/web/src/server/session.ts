import { prisma } from "@/server/db";
import { getSession } from "@/server/auth";

export async function currentUser() {
  const s = await getSession();
  if (!s) return null;
  return prisma.user.findUnique({
    where: { id: s.userId },
    include: { supplier: true, customer: true },
  });
}

export async function getCustomerId(): Promise<string | null> {
  const s = await getSession();
  if (!s || s.role !== "customer") return null;
  const c = await prisma.customerProfile.findUnique({ where: { userId: s.userId } });
  return c?.id ?? null;
}

export async function getSupplierId(): Promise<string | null> {
  const s = await getSession();
  if (!s || s.role !== "supplier") return null;
  const sp = await prisma.supplierProfile.findUnique({ where: { userId: s.userId } });
  return sp?.id ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const s = await getSession();
  return s?.role === "admin";
}

export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}
