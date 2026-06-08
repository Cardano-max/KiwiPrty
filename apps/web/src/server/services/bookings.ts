import { prisma } from "@/server/db";
import { validateQuantity } from "@/domain/pricing";
import { toPricing, parseList } from "@/server/mappers";
import { notify } from "@/server/services/notifications";

export async function createBooking(
  customerId: string,
  productId: string,
  quantity: number,
  expectedDate?: string,
  note?: string,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { priceSlabs: true, supplier: true },
  });
  if (!product) throw new Error("Product not found");
  const v = validateQuantity(toPricing(product), quantity);
  if (!v.ok) throw new Error(v.errors.join("; "));

  const booking = await prisma.advanceBooking.create({
    data: {
      customerId,
      productId,
      supplierId: product.supplierId,
      quantity,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      note: note || null,
    },
  });

  await notify(product.supplier.userId, {
    type: "order",
    title: "New advance booking",
    body: `${quantity} × ${product.name}`,
    link: "/supplier/bookings",
    phone: parseList(product.supplier.mobiles)[0],
    viaWhatsApp: true,
  });
  return booking;
}

export async function listCustomerBookings(customerId: string) {
  return prisma.advanceBooking.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { product: true, supplier: true },
  });
}

export async function listSupplierBookings(supplierId: string) {
  return prisma.advanceBooking.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: { product: true, customer: true },
  });
}

export async function setBookingStatus(supplierId: string, bookingId: string, status: string) {
  if (!["requested", "confirmed", "fulfilled", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.advanceBooking.updateMany({ where: { id: bookingId, supplierId }, data: { status } });
}
