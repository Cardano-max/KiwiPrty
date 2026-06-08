import { getSessionFromRequest } from "@/server/auth";
import { prisma } from "@/server/db";

export async function customerIdFromRequest(req: Request): Promise<string | null> {
  const s = await getSessionFromRequest(req);
  if (!s || s.role !== "customer") return null;
  const c = await prisma.customerProfile.findUnique({ where: { userId: s.userId } });
  return c?.id ?? null;
}

export async function supplierIdFromRequest(req: Request): Promise<string | null> {
  const s = await getSessionFromRequest(req);
  if (!s || s.role !== "supplier") return null;
  const sp = await prisma.supplierProfile.findUnique({ where: { userId: s.userId } });
  return sp?.id ?? null;
}
