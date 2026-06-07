import Link from "next/link";
import { formatPaise } from "@/domain/money";
import { TagList, Stars } from "@/components/ui";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    basePricePaise: number;
    unitLabel: string;
    moq: number;
    serviceCity: string | null;
    status: string;
    tags: string;
    ratingAvg: number;
    ratingCount: number;
    images: { url: string }[];
    supplier: { companyName: string; city: string | null };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const img = product.images[0]?.url;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🎁</div>
        )}
        <div className="absolute left-2 top-2">
          <TagList tags={product.tags} />
        </div>
        {product.status === "out_of_stock" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-white px-2 py-1 text-xs font-bold text-red-600">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
        <div className="mt-1 text-lg font-bold text-kiwi-700">
          {formatPaise(product.basePricePaise)}
          <span className="text-xs font-normal text-gray-500"> / {product.unitLabel}</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">MOQ {product.moq} {product.unitLabel}</div>
        {product.ratingCount > 0 && (
          <div className="mt-0.5 text-xs">
            <Stars value={product.ratingAvg} className="text-[11px]" />{" "}
            <span className="text-gray-400">({product.ratingCount})</span>
          </div>
        )}
        <div className="mt-auto pt-2 text-xs text-gray-600">
          {product.supplier.companyName}
          {product.serviceCity ? ` · ${product.serviceCity}` : ""}
        </div>
      </div>
    </Link>
  );
}
