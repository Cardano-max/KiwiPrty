import type { MetadataRoute } from "next";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({ where: { status: "active" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.supplierProfile.findMany({ where: { kycStatus: "approved" }, select: { id: true } }),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/stories`, changeFrequency: "daily", priority: 0.7 },
    ...categories.map((c) => ({
      url: `${base}/products?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...suppliers.map((s) => ({
      url: `${base}/suppliers/${s.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
