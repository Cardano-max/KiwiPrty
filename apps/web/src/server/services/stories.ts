import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

// A story is visible while not expired, or permanently if it's a highlight.
function activeWhere(): Prisma.StoryWhereInput {
  return { OR: [{ isHighlight: true }, { expiresAt: { gt: new Date() } }] };
}

const feedInclude = {
  supplier: true,
  linkedProduct: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
} satisfies Prisma.StoryInclude;

export async function listStoriesFeed() {
  return prisma.story.findMany({
    where: { supplier: { kycStatus: "approved" }, ...activeWhere() },
    orderBy: { createdAt: "desc" },
    include: feedInclude,
    take: 60,
  });
}

export async function getStory(id: string) {
  return prisma.story.findUnique({
    where: { id },
    include: {
      supplier: true,
      linkedProduct: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, priceSlabs: true } },
    },
  });
}

export async function recordStoryView(storyId: string, customerId: string) {
  try {
    await prisma.storyView.create({ data: { storyId, customerId } });
    await prisma.story.update({ where: { id: storyId }, data: { viewCount: { increment: 1 } } });
  } catch {
    // unique [storyId, customerId] — already viewed; ignore
  }
}

export async function getSupplierStories(supplierId: string) {
  return prisma.story.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: {
      linkedProduct: true,
      _count: { select: { views: true, inquiries: true } },
    },
  });
}

export interface CreateStoryInput {
  type: string;
  mediaUrl: string;
  caption?: string;
  linkedProductId?: string;
  offerText?: string;
  isHighlight?: boolean;
}

export async function createStory(supplierId: string, input: CreateStoryInput) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return prisma.story.create({
    data: {
      supplierId,
      type: input.type,
      mediaUrl: input.mediaUrl,
      caption: input.caption,
      linkedProductId: input.linkedProductId || null,
      offerText: input.offerText || null,
      isHighlight: !!input.isHighlight,
      expiresAt,
    },
  });
}
