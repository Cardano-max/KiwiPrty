import type { ProductPricing } from "@/domain/pricing";

interface SlabLike {
  minQty: number;
  maxQty: number | null;
  unitPricePaise: number;
}

interface ProductPricingSource {
  basePricePaise: number;
  gstPercent: number;
  moq: number;
  quantityMultiple: number;
  priceSlabs: SlabLike[];
}

/** Map a persisted product (+slabs) to the domain pricing shape. */
export function toPricing(p: ProductPricingSource): ProductPricing {
  return {
    basePricePaise: p.basePricePaise,
    gstPercent: p.gstPercent,
    moq: p.moq,
    quantityMultiple: p.quantityMultiple,
    priceSlabs: p.priceSlabs.map((s) => ({
      minQty: s.minQty,
      maxQty: s.maxQty,
      unitPricePaise: s.unitPricePaise,
    })),
  };
}

/** Parse a JSON-string list field (used for SQLite portability). */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
