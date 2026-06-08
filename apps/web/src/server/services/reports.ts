import { prisma } from "@/server/db";

export async function customerPurchaseReport(customerId: string) {
  const [orders, items] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: { supplierOrders: { include: { supplier: true } } },
    }),
    prisma.orderItem.findMany({
      where: { supplierOrder: { order: { customerId } } },
      include: { product: { include: { category: true } } },
    }),
  ]);

  const totalOrders = orders.length;
  const totalSpendPaise = orders.reduce((s, o) => s + o.totalPaise, 0);

  const bySupplier = new Map<string, number>();
  for (const o of orders) {
    for (const so of o.supplierOrders) {
      bySupplier.set(so.supplier.companyName, (bySupplier.get(so.supplier.companyName) ?? 0) + so.totalPaise);
    }
  }

  const byCategory = new Map<string, number>();
  for (const it of items) {
    const c = it.product.category.name;
    byCategory.set(c, (byCategory.get(c) ?? 0) + it.lineTotalPaise);
  }

  const sortDesc = (m: Map<string, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, paise]) => ({ name, paise }));

  return {
    totalOrders,
    totalSpendPaise,
    supplierBreakdown: sortDesc(bySupplier),
    categoryBreakdown: sortDesc(byCategory),
  };
}

export async function supplierAnalytics(supplierId: string) {
  const [products, inquiriesCount, ordersCount, supplierOrders] = await Promise.all([
    prisma.product.findMany({ where: { supplierId }, orderBy: { viewCount: "desc" } }),
    prisma.inquiry.count({ where: { supplierId } }),
    prisma.supplierOrder.count({ where: { supplierId } }),
    prisma.supplierOrder.findMany({
      where: { supplierId },
      include: { order: { include: { customer: true } } },
    }),
  ]);

  const totalViews = products.reduce((s, p) => s + p.viewCount, 0);
  const cityDemand = new Map<string, number>();
  for (const so of supplierOrders) {
    const city = so.order.customer.city ?? "Unknown";
    cityDemand.set(city, (cityDemand.get(city) ?? 0) + 1);
  }

  return {
    funnel: {
      views: totalViews,
      inquiries: inquiriesCount,
      orders: ordersCount,
      viewToInquiryPct: totalViews ? (inquiriesCount / totalViews) * 100 : 0,
      inquiryToOrderPct: inquiriesCount ? (ordersCount / inquiriesCount) * 100 : 0,
    },
    topProducts: products.slice(0, 5),
    cityDemand: [...cityDemand.entries()].sort((a, b) => b[1] - a[1]),
  };
}
