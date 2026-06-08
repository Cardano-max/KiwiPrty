import { prisma } from "@/server/db";
import { isConfigured } from "@/server/config";
import { notify } from "@/server/services/notifications";

export async function getPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { audience: "asc" } });
}

/**
 * Activate membership for a user (mock payment for the MVP — a real build wires
 * Razorpay subscription mandates here). Creates a Subscription, records a
 * Payment, flips the profile's planStatus to active, and notifies the user.
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

  let subscriptionId = "";
  if (audience === "supplier" && user.supplier) {
    const sub = await prisma.subscription.create({
      data: { planId: plan.id, supplierId: user.supplier.id, status: "active", periodEnd },
    });
    subscriptionId = sub.id;
    await prisma.supplierProfile.update({
      where: { id: user.supplier.id },
      data: { planStatus: "active" },
    });
  } else if (user.customer) {
    const sub = await prisma.subscription.create({
      data: { planId: plan.id, customerId: user.customer.id, status: "active", periodEnd },
    });
    subscriptionId = sub.id;
    await prisma.customerProfile.update({
      where: { id: user.customer.id },
      data: { planStatus: "active" },
    });
  }

  await prisma.payment.create({
    data: {
      purpose: "subscription",
      referenceId: subscriptionId || userId,
      amountPaise: plan.pricePaise,
      status: "paid",
      provider: isConfigured.razorpay() ? "razorpay" : "mock",
    },
  });

  await notify(userId, {
    type: "payment",
    title: "Membership active ✓",
    body: `${plan.name} is now active.`,
    link: "/pricing",
  });
}
