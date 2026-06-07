import { prisma } from "@/server/db";

/** A customer may review a product only if they have ordered it. */
export async function hasPurchased(customerId: string, productId: string): Promise<boolean> {
  const item = await prisma.orderItem.findFirst({
    where: { productId, supplierOrder: { order: { customerId } } },
  });
  return !!item;
}

export async function listProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerReview(customerId: string, productId: string) {
  return prisma.review.findUnique({
    where: { productId_customerId: { productId, customerId } },
  });
}

export async function createReview(
  customerId: string,
  productId: string,
  rating: number,
  text: string,
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a whole number from 1 to 5");
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  if (!(await hasPurchased(customerId, productId))) {
    throw new Error("Only verified buyers who ordered this product can review it");
  }

  await prisma.review.upsert({
    where: { productId_customerId: { productId, customerId } },
    create: { productId, supplierId: product.supplierId, customerId, rating, text: text || null },
    update: { rating, text: text || null },
  });

  await recomputeProductRating(productId);
  await recomputeSupplierTrust(product.supplierId);
}

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
}

async function recomputeSupplierTrust(supplierId: string) {
  const agg = await prisma.review.aggregate({
    where: { supplierId },
    _avg: { rating: true },
    _count: true,
  });
  if (agg._count > 0) {
    // map average rating 0..5 to a 0..100 trust score
    await prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { trustScore: Math.round((agg._avg.rating ?? 0) * 20) },
    });
  }
}
