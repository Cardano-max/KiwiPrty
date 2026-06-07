import { prisma } from "@/server/db";

export async function getPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { audience: "asc" } });
}

/**
 * Activate membership for a user (mock payment for the MVP — a real build wires
 * Razorpay subscription mandates here). Creates a Subscription and flips the
 * profile's planStatus to active, which feeds admin subscription revenue.
 */
export async function activateMembership(userId: string, role: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true, supplier: true },
  });
  if (!user) throw new Error("User not found");

  const audience = role === "supplier" ? "supplier" : "customer";
  const plan = await prisma.subscriptionPlan.findFirst({ where: { audience } });
  if (!plan) throw new Error("No plan available for your account type");

  const periodEnd = new Date();
  if (plan.interval === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  if (audience === "supplier" && user.supplier) {
    await prisma.subscription.create({
      data: { planId: plan.id, supplierId: user.supplier.id, status: "active", periodEnd },
    });
    await prisma.supplierProfile.update({
      where: { id: user.supplier.id },
      data: { planStatus: "active" },
    });
  } else if (user.customer) {
    await prisma.subscription.create({
      data: { planId: plan.id, customerId: user.customer.id, status: "active", periodEnd },
    });
    await prisma.customerProfile.update({
      where: { id: user.customer.id },
      data: { planStatus: "active" },
    });
  }
}
