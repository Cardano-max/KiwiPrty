import { prisma } from "@/server/db";
import { validateQuantity } from "@/domain/pricing";
import { splitCartIntoSupplierOrders, type CartLine } from "@/domain/order";
import { invoiceNumber } from "@/domain/invoice";
import { formatPaise } from "@/domain/money";
import { toPricing, parseList } from "@/server/mappers";
import { notify } from "@/server/services/notifications";
import { isConfigured } from "@/server/config";

const supplierOrderInclude = {
  items: true,
  supplier: true,
  invoice: true,
};

/**
 * Checkout: validate the cart, split into per-supplier orders, persist the
 * parent order + supplier orders + items + one GST invoice per supplier order,
 * decrement stock, and clear the cart — all in one transaction. (docs/03 §B/§C)
 * Payment is recorded as paid (mock gateway) for the MVP.
 */
export async function checkout(customerId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: { include: { product: { include: { priceSlabs: true } } } } },
  });
  if (!cart || cart.items.length === 0) throw new Error("Your cart is empty");

  const lines: CartLine[] = [];
  for (const it of cart.items) {
    const pricing = toPricing(it.product);
    const v = validateQuantity(pricing, it.quantity);
    if (!v.ok) throw new Error(`${it.product.name}: ${v.errors.join("; ")}`);
    if (it.quantity > it.product.stockQuantity) {
      throw new Error(`${it.product.name}: only ${it.product.stockQuantity} in stock`);
    }
    lines.push({
      productId: it.productId,
      productName: it.product.name,
      supplierId: it.product.supplierId,
      quantity: it.quantity,
      pricing,
    });
  }

  const split = splitCartIntoSupplierOrders(lines);

  const created = await prisma.$transaction(async (tx) => {
    let seq = await tx.invoice.count();
    const order = await tx.order.create({
      data: { customerId, totalPaise: split.totalPaise, paymentStatus: "paid" },
    });

    for (const so of split.supplierOrders) {
      const supplierOrder = await tx.supplierOrder.create({
        data: {
          orderId: order.id,
          supplierId: so.supplierId,
          status: "new",
          subtotalPaise: so.subtotalPaise,
          gstPaise: so.gstPaise,
          totalPaise: so.totalPaise,
          items: {
            create: so.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              unitPricePaise: i.unitPricePaise,
              gstPercent: i.gstPercent,
              lineTotalPaise: i.lineTotalPaise,
            })),
          },
        },
      });

      seq += 1;
      await tx.invoice.create({
        data: {
          supplierOrderId: supplierOrder.id,
          number: invoiceNumber(seq),
          type: "gst_invoice",
          amountPaise: so.totalPaise,
          gstPaise: so.gstPaise,
        },
      });

      for (const i of so.items) {
        await tx.product.update({
          where: { id: i.productId },
          data: { stockQuantity: { decrement: i.quantity }, orderCount: { increment: 1 } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });

  // Record the payment. Mock by default; with Razorpay configured the real
  // capture is confirmed via the webhook (see /api/payments/razorpay/webhook).
  await prisma.payment.create({
    data: {
      purpose: "order",
      referenceId: created.id,
      amountPaise: split.totalPaise,
      status: "paid",
      provider: isConfigured.razorpay() ? "razorpay" : "mock",
    },
  });

  // Notify suppliers and the buyer (in-app + WhatsApp when configured).
  const buyer = await prisma.customerProfile.findUnique({ where: { id: customerId } });
  for (const so of split.supplierOrders) {
    const supplier = await prisma.supplierProfile.findUnique({ where: { id: so.supplierId } });
    if (supplier) {
      await notify(supplier.userId, {
        type: "order",
        title: "New order received",
        body: `Order worth ${formatPaise(so.totalPaise)}`,
        link: "/supplier/orders",
        phone: parseList(supplier.mobiles)[0],
        viaWhatsApp: true,
      });
    }
  }
  if (buyer) {
    await notify(buyer.userId, {
      type: "order",
      title: "Order placed 🎉",
      body: `Confirmed across ${split.supplierOrders.length} supplier(s).`,
      link: `/orders/${created.id}`,
    });
  }

  return getOrder(created.id, customerId);
}

export async function getOrder(orderId: string, customerId?: string) {
  return prisma.order.findFirst({
    where: { id: orderId, ...(customerId ? { customerId } : {}) },
    include: {
      customer: true,
      supplierOrders: { include: supplierOrderInclude },
    },
  });
}

export async function listCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { placedAt: "desc" },
    include: { supplierOrders: { include: supplierOrderInclude } },
  });
}

export async function listSupplierOrders(supplierId: string) {
  return prisma.supplierOrder.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: { items: true, invoice: true, order: { include: { customer: true } } },
  });
}

const SUPPLIER_ORDER_STATUSES = ["new", "accepted", "packed", "dispatched", "delivered", "cancelled"];

export async function setSupplierOrderStatus(
  supplierOrderId: string,
  supplierId: string,
  status: string,
) {
  if (!SUPPLIER_ORDER_STATUSES.includes(status)) throw new Error("Invalid status");
  const so = await prisma.supplierOrder.findFirst({ where: { id: supplierOrderId, supplierId } });
  if (!so) throw new Error("Order not found");
  await prisma.supplierOrder.update({ where: { id: supplierOrderId }, data: { status } });
}
