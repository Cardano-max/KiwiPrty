// Core B2B pricing rules: MOQ, quantity multiples, and quantity-based price slabs.
// All computed server-side; never trust a client-supplied price. See docs/03 §A.

export interface PriceSlab {
  minQty: number;
  /** null = open-ended top slab */
  maxQty: number | null;
  unitPricePaise: number;
}

export interface ProductPricing {
  basePricePaise: number;
  gstPercent: number;
  moq: number;
  quantityMultiple: number;
  priceSlabs: PriceSlab[];
}

/**
 * Resolve the unit price for a given quantity: the slab whose [minQty, maxQty]
 * range contains qty wins. Falls back to basePricePaise when no slab matches.
 */
export function resolveUnitPricePaise(pricing: ProductPricing, qty: number): number {
  const slabs = [...pricing.priceSlabs].sort((a, b) => a.minQty - b.minQty);
  for (const slab of slabs) {
    const aboveMin = qty >= slab.minQty;
    const belowMax = slab.maxQty == null || qty <= slab.maxQty;
    if (aboveMin && belowMax) return slab.unitPricePaise;
  }
  return pricing.basePricePaise;
}

export interface QtyValidation {
  ok: boolean;
  errors: string[];
}

/** Enforce positive integer quantity, MOQ, and quantity-multiple rules. */
export function validateQuantity(pricing: ProductPricing, qty: number): QtyValidation {
  const errors: string[] = [];
  if (!Number.isInteger(qty) || qty <= 0) {
    errors.push("Quantity must be a positive whole number");
    return { ok: false, errors };
  }
  if (qty < pricing.moq) {
    errors.push(`Minimum order quantity is ${pricing.moq}`);
  }
  if (pricing.quantityMultiple > 1 && qty % pricing.quantityMultiple !== 0) {
    errors.push(`Quantity must be in multiples of ${pricing.quantityMultiple}`);
  }
  return { ok: errors.length === 0, errors };
}

export interface LineComputation {
  unitPricePaise: number;
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
}

/** Compute a single order line: resolved unit price, subtotal, GST, and total. */
export function computeLine(pricing: ProductPricing, qty: number): LineComputation {
  const unitPricePaise = resolveUnitPricePaise(pricing, qty);
  const subtotalPaise = unitPricePaise * qty;
  const gstPaise = Math.round((subtotalPaise * pricing.gstPercent) / 100);
  return {
    unitPricePaise,
    subtotalPaise,
    gstPaise,
    totalPaise: subtotalPaise + gstPaise,
  };
}
