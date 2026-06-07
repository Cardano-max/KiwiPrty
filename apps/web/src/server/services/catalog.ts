import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

export type ProductSort = "popular" | "price_asc" | "price_desc" | "new";

export interface SearchOptions {
  q?: string;
  categorySlug?: string;
  city?: string;
  tag?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  priceSlabs: { orderBy: { minQty: "asc" } },
  supplier: true,
  category: true,
} satisfies Prisma.ProductInclude;

export async function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: true },
  });
}

export async function searchProducts(opts: SearchOptions) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(60, opts.pageSize ?? 24);

  const where: Prisma.ProductWhereInput = {
    status: "active",
    supplier: { kycStatus: "approved" },
  };

  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q } },
      { description: { contains: opts.q } },
      { material: { contains: opts.q } },
      { color: { contains: opts.q } },
      { tags: { contains: opts.q } },
    ];
  }
  if (opts.categorySlug) where.category = { slug: opts.categorySlug };
  if (opts.city) where.serviceCity = opts.city;
  if (opts.tag) where.tags = { contains: opts.tag };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    opts.sort === "price_asc"
      ? { basePricePaise: "asc" }
      : opts.sort === "price_desc"
        ? { basePricePaise: "desc" }
        : opts.sort === "new"
          ? { createdAt: "desc" }
          : { orderCount: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: productInclude,
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (product) {
    // best-effort view counter; ignore failures
    prisma.product
      .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});
  }
  return product;
}

export async function getCities(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: "active", serviceCity: { not: null } },
    distinct: ["serviceCity"],
    select: { serviceCity: true },
  });
  return rows.map((r) => r.serviceCity!).filter(Boolean).sort();
}

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
