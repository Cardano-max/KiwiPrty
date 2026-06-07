import { prisma } from "@/server/db";

export async function adminStats() {
  const [suppliers, customers, products, orders, activeSubs] = await Promise.all([
    prisma.supplierProfile.count(),
    prisma.customerProfile.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.order.aggregate({ _sum: { totalPaise: true }, _count: true }),
    prisma.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    }),
  ]);

  const subscriptionRevenuePaise = activeSubs.reduce((s, sub) => s + sub.plan.pricePaise, 0);

  const [pendingSuppliers, pendingCustomers] = await Promise.all([
    prisma.supplierProfile.count({ where: { kycStatus: { in: ["submitted", "under_review"] } } }),
    prisma.customerProfile.count({ where: { kycStatus: { in: ["submitted", "under_review"] } } }),
  ]);

  return {
    suppliers,
    customers,
    activeProducts: products,
    gmvPaise: orders._sum.totalPaise ?? 0,
    orderCount: orders._count,
    subscriptionRevenuePaise,
    pendingSuppliers,
    pendingCustomers,
  };
}

export async function listSuppliers(status?: string) {
  return prisma.supplierProfile.findMany({
    where: status ? { kycStatus: status } : {},
    include: { user: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listCustomers(status?: string) {
  return prisma.customerProfile.findMany({
    where: status ? { kycStatus: status } : {},
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function setSupplierKyc(supplierId: string, kycStatus: string, actorId?: string) {
  const planStatus = kycStatus === "approved" ? "active" : undefined;
  const supplier = await prisma.supplierProfile.update({
    where: { id: supplierId },
    data: {
      kycStatus,
      ...(planStatus ? { planStatus } : {}),
      ...(kycStatus === "approved" ? { verifiedBadges: JSON.stringify(["gst_verified"]) } : {}),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId,
      action: `supplier.kyc.${kycStatus}`,
      entityType: "SupplierProfile",
      entityId: supplierId,
    },
  });
  return supplier;
}

export async function setCustomerKyc(customerId: string, kycStatus: string, actorId?: string) {
  const planStatus = kycStatus === "approved" ? "active" : undefined;
  const customer = await prisma.customerProfile.update({
    where: { id: customerId },
    data: { kycStatus, ...(planStatus ? { planStatus } : {}) },
  });
  await prisma.auditLog.create({
    data: {
      actorId,
      action: `customer.kyc.${kycStatus}`,
      entityType: "CustomerProfile",
      entityId: customerId,
    },
  });
  return customer;
}
