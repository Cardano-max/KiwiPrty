import { prisma } from "@/server/db";

export async function getSupplierByUserId(userId: string) {
  return prisma.supplierProfile.findUnique({ where: { userId } });
}

/** Public supplier profile: approved supplier with products, active stories and counts. */
export async function getPublicSupplier(id: string) {
  const supplier = await prisma.supplierProfile.findFirst({
    where: { id, kycStatus: "approved" },
    include: {
      products: {
        where: { status: { not: "inactive" } },
        orderBy: { orderCount: "desc" },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, supplier: true },
      },
      stories: {
        where: { OR: [{ isHighlight: true }, { expiresAt: { gt: new Date() } }] },
        orderBy: { createdAt: "desc" },
        include: { linkedProduct: { include: { images: { take: 1 } } } },
      },
    },
  });
  if (!supplier) return null;
  const totalViews = supplier.products.reduce((s, p) => s + p.viewCount, 0);
  return { supplier, stats: { products: supplier.products.length, stories: supplier.stories.length, totalViews } };
}

export async function getSupplierDashboard(supplierId: string) {
  const [productCount, supplierOrders, inquiries, products] = await Promise.all([
    prisma.product.count({ where: { supplierId } }),
    prisma.supplierOrder.findMany({
      where: { supplierId },
      include: { order: { include: { customer: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.inquiry.findMany({
      where: { supplierId },
      include: { product: true, customer: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({ where: { supplierId }, select: { viewCount: true } }),
  ]);

  const totalSalesPaise = supplierOrders.reduce((s, o) => s + o.totalPaise, 0);
  const totalViews = products.reduce((s, p) => s + p.viewCount, 0);
  const ordersCount = await prisma.supplierOrder.count({ where: { supplierId } });
  const inquiriesCount = await prisma.inquiry.count({ where: { supplierId } });

  return {
    stats: { productCount, ordersCount, inquiriesCount, totalSalesPaise, totalViews },
    recentOrders: supplierOrders,
    recentInquiries: inquiries,
  };
}

export async function listSupplierProducts(supplierId: string) {
  return prisma.product.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, priceSlabs: true, category: true },
  });
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  basePricePaise: number;
  gstPercent: number;
  moq: number;
  quantityMultiple: number;
  stockQuantity: number;
  unitLabel: string;
  serviceCity?: string;
  description?: string;
  material?: string;
  color?: string;
  imageUrl?: string;
  tags?: string[];
  slabs?: { minQty: number; maxQty: number | null; unitPricePaise: number }[];
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createProduct(supplierId: string, input: CreateProductInput) {
  return prisma.product.create({
    data: {
      supplierId,
      categoryId: input.categoryId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      basePricePaise: input.basePricePaise,
      gstPercent: input.gstPercent,
      moq: input.moq,
      quantityMultiple: input.quantityMultiple,
      stockQuantity: input.stockQuantity,
      unitLabel: input.unitLabel,
      serviceCity: input.serviceCity,
      material: input.material,
      color: input.color,
      status: "active",
      tags: JSON.stringify(input.tags ?? []),
      images: input.imageUrl ? { create: [{ url: input.imageUrl, sortOrder: 0 }] } : undefined,
      priceSlabs: input.slabs?.length ? { create: input.slabs } : undefined,
    },
    include: { priceSlabs: true, images: true },
  });
}
