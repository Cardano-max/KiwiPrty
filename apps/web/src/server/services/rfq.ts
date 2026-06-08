import { prisma } from "@/server/db";
import { notify } from "@/server/services/notifications";

export async function createRfq(
  customerId: string,
  input: { title: string; detail?: string; categoryId?: string; targetQty?: number },
) {
  return prisma.rfq.create({
    data: {
      customerId,
      title: input.title,
      detail: input.detail || null,
      categoryId: input.categoryId || null,
      targetQty: input.targetQty || null,
    },
  });
}

export async function listCustomerRfqs(customerId: string) {
  return prisma.rfq.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { quotes: true } } },
  });
}

export async function listOpenRfqs() {
  return prisma.rfq.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    include: { category: true, customer: true, _count: { select: { quotes: true } } },
    take: 50,
  });
}

export async function getRfq(id: string) {
  return prisma.rfq.findUnique({
    where: { id },
    include: {
      category: true,
      customer: true,
      quotes: { include: { supplier: true }, orderBy: { pricePaise: "asc" } },
    },
  });
}

export async function createQuote(
  supplierId: string,
  rfqId: string,
  input: { pricePaise: number; moq?: number; note?: string },
) {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId }, include: { customer: true } });
  if (!rfq) throw new Error("RFQ not found");
  if (rfq.status !== "open") throw new Error("This RFQ is closed");

  const quote = await prisma.quote.upsert({
    where: { rfqId_supplierId: { rfqId, supplierId } },
    create: { rfqId, supplierId, pricePaise: input.pricePaise, moq: input.moq || null, note: input.note || null },
    update: { pricePaise: input.pricePaise, moq: input.moq || null, note: input.note || null },
  });

  await notify(rfq.customer.userId, {
    type: "inquiry",
    title: "New quote received",
    body: `A supplier quoted on “${rfq.title}”.`,
    link: `/rfq/${rfqId}`,
  });
  return quote;
}

export async function closeRfq(customerId: string, rfqId: string) {
  await prisma.rfq.updateMany({ where: { id: rfqId, customerId }, data: { status: "closed" } });
}
