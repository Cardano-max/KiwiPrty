import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { validateQuantity } from "@/domain/pricing";
import { splitCartIntoSupplierOrders, type CartLine } from "@/domain/order";
import { toPricing } from "@/server/mappers";

const cartItemInclude = {
  product: {
    include: {
      priceSlabs: { orderBy: { minQty: "asc" } },
      supplier: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  },
} satisfies Prisma.CartItemInclude;

export async function getOrCreateCart(customerId: string) {
  return prisma.cart.upsert({
    where: { customerId },
    create: { customerId },
    update: {},
  });
}

export async function getCartView(customerId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: { include: cartItemInclude, orderBy: { createdAt: "asc" } } },
  });
  const items = cart?.items ?? [];
  const lines: CartLine[] = items.map((it) => ({
    productId: it.productId,
    productName: it.product.name,
    supplierId: it.product.supplierId,
    quantity: it.quantity,
    pricing: toPricing(it.product),
  }));
  const split = splitCartIntoSupplierOrders(lines);
  const supplierNames = new Map(items.map((it) => [it.product.supplierId, it.product.supplier.companyName]));
  return { items, split, supplierNames };
}

export async function cartCount(customerId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: true },
  });
  return cart?.items.length ?? 0;
}

async function loadProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { priceSlabs: true },
  });
  if (!product) throw new Error("Product not found");
  return product;
}

export async function addToCart(customerId: string, productId: string, quantity: number) {
  const product = await loadProduct(productId);
  const v = validateQuantity(toPricing(product), quantity);
  if (!v.ok) throw new Error(v.errors.join("; "));
  if (quantity > product.stockQuantity) throw new Error(`Only ${product.stockQuantity} in stock`);
  const cart = await getOrCreateCart(customerId);
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, supplierId: product.supplierId, quantity },
    update: { quantity },
  });
}

export async function updateCartItem(customerId: string, productId: string, quantity: number) {
  if (quantity <= 0) return removeCartItem(customerId, productId);
  const product = await loadProduct(productId);
  const v = validateQuantity(toPricing(product), quantity);
  if (!v.ok) throw new Error(v.errors.join("; "));
  if (quantity > product.stockQuantity) throw new Error(`Only ${product.stockQuantity} in stock`);
  const cart = await getOrCreateCart(customerId);
  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });
}

export async function removeCartItem(customerId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
}
