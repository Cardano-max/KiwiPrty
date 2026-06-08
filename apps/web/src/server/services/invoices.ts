import { prisma } from "@/server/db";
import type { SessionPayload } from "@/server/auth";

/**
 * Fetch a supplier order + its GST invoice for a requester, authorising that the
 * requester is the buyer who placed it, the supplier who fulfils it, or an admin.
 */
export async function getInvoiceForRequester(supplierOrderId: string, session: SessionPayload) {
  const so = await prisma.supplierOrder.findUnique({
    where: { id: supplierOrderId },
    include: {
      items: true,
      invoice: true,
      supplier: true,
      order: { include: { customer: { include: { addresses: true } } } },
    },
  });
  if (!so || !so.invoice) return null;

  if (session.role === "admin") return so;
  if (session.role === "customer") {
    const c = await prisma.customerProfile.findUnique({ where: { userId: session.userId } });
    if (c && so.order.customerId === c.id) return so;
  }
  if (session.role === "supplier") {
    const s = await prisma.supplierProfile.findUnique({ where: { userId: session.userId } });
    if (s && so.supplierId === s.id) return so;
  }
  return null;
}
