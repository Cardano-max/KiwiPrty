import { prisma } from "@/server/db";
import { scoreLead } from "@/domain/leadScore";
import { notify } from "@/server/services/notifications";
import { parseList } from "@/server/mappers";

export async function createInquiry(
  customerId: string,
  productId: string,
  message: string,
  channel: "in_app" | "whatsapp" = "in_app",
  storyId?: string,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  // Heuristic lead score from this customer's recent engagement with this supplier.
  const [productsViewed, priorInquiries] = await Promise.all([
    prisma.inquiry.count({ where: { customerId, supplierId: product.supplierId } }),
    prisma.inquiry.count({ where: { customerId, supplierId: product.supplierId } }),
  ]);
  const score = scoreLead({ productsViewed: productsViewed + 1, inquiries: priorInquiries + 1, messages: 1 });

  const inquiry = await prisma.inquiry.create({
    data: {
      customerId,
      productId,
      supplierId: product.supplierId,
      message,
      channel,
      score,
      storyId: storyId || null,
    },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { inquiryCount: { increment: 1 } },
  });

  // notify the supplier (in-app + WhatsApp when configured)
  const supplier = await prisma.supplierProfile.findUnique({ where: { id: product.supplierId } });
  if (supplier) {
    await notify(supplier.userId, {
      type: "inquiry",
      title: `New inquiry (${score})`,
      body: message,
      link: "/supplier",
      phone: parseList(supplier.mobiles)[0],
      viaWhatsApp: true,
    });
  }
  return inquiry;
}

export async function listSupplierInquiries(supplierId: string) {
  return prisma.inquiry.findMany({
    where: { supplierId },
    include: { product: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
}
