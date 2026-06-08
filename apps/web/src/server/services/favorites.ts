import { prisma } from "@/server/db";

export async function toggleFavorite(customerId: string, productId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: { customerId_productId: { customerId, productId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.favorite.create({ data: { customerId, productId } });
  return true;
}

export async function isFavorited(customerId: string, productId: string): Promise<boolean> {
  const fav = await prisma.favorite.findUnique({
    where: { customerId_productId: { customerId, productId } },
  });
  return !!fav;
}

export async function listFavorites(customerId: string) {
  return prisma.favorite.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, supplier: true },
      },
    },
  });
}

export async function favoriteCount(customerId: string): Promise<number> {
  return prisma.favorite.count({ where: { customerId } });
}
