import { describe, it, expect } from "vitest";
import {
  resolveUnitPricePaise,
  validateQuantity,
  computeLine,
  type ProductPricing,
} from "./pricing";

const balloons: ProductPricing = {
  basePricePaise: 1200, // ₹12 default
  gstPercent: 18,
  moq: 100,
  quantityMultiple: 100,
  priceSlabs: [
    { minQty: 100, maxQty: 299, unitPricePaise: 1000 }, // ₹10
    { minQty: 300, maxQty: 999, unitPricePaise: 900 }, // ₹9
    { minQty: 1000, maxQty: null, unitPricePaise: 800 }, // ₹8 open-ended
  ],
};

describe("resolveUnitPricePaise", () => {
  it("picks the slab containing the quantity", () => {
    expect(resolveUnitPricePaise(balloons, 100)).toBe(1000);
    expect(resolveUnitPricePaise(balloons, 250)).toBe(1000);
    expect(resolveUnitPricePaise(balloons, 300)).toBe(900);
    expect(resolveUnitPricePaise(balloons, 999)).toBe(900);
  });

  it("honours the open-ended top slab", () => {
    expect(resolveUnitPricePaise(balloons, 1000)).toBe(800);
    expect(resolveUnitPricePaise(balloons, 50000)).toBe(800);
  });

  it("falls back to base price below the first slab", () => {
    expect(resolveUnitPricePaise(balloons, 50)).toBe(1200);
  });

  it("respects slab boundaries exactly", () => {
    expect(resolveUnitPricePaise(balloons, 299)).toBe(1000);
    expect(resolveUnitPricePaise(balloons, 300)).toBe(900);
  });

  it("is order-independent (sorts slabs)", () => {
    const shuffled: ProductPricing = {
      ...balloons,
      priceSlabs: [
        { minQty: 1000, maxQty: null, unitPricePaise: 800 },
        { minQty: 100, maxQty: 299, unitPricePaise: 1000 },
        { minQty: 300, maxQty: 999, unitPricePaise: 900 },
      ],
    };
    expect(resolveUnitPricePaise(shuffled, 350)).toBe(900);
  });
});

describe("validateQuantity", () => {
  it("accepts a valid quantity", () => {
    expect(validateQuantity(balloons, 200)).toEqual({ ok: true, errors: [] });
  });

  it("rejects below MOQ", () => {
    const r = validateQuantity(balloons, 50);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("Minimum order quantity"))).toBe(true);
  });

  it("rejects non-multiples", () => {
    const r = validateQuantity(balloons, 150);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("multiples of 100"))).toBe(true);
  });

  it("rejects zero, negative, and fractional", () => {
    expect(validateQuantity(balloons, 0).ok).toBe(false);
    expect(validateQuantity(balloons, -100).ok).toBe(false);
    expect(validateQuantity(balloons, 100.5).ok).toBe(false);
  });

  it("ignores multiple rule when quantityMultiple is 1", () => {
    const p: ProductPricing = { ...balloons, moq: 1, quantityMultiple: 1 };
    expect(validateQuantity(p, 7).ok).toBe(true);
  });
});

describe("computeLine", () => {
  it("computes subtotal, GST and total", () => {
    // 300 @ ₹9 = ₹2700 ; GST 18% = ₹486 ; total ₹3186
    const line = computeLine(balloons, 300);
    expect(line.unitPricePaise).toBe(900);
    expect(line.subtotalPaise).toBe(270000);
    expect(line.gstPaise).toBe(48600);
    expect(line.totalPaise).toBe(318600);
  });

  it("rounds GST to the nearest paise", () => {
    const p: ProductPricing = {
      basePricePaise: 333,
      gstPercent: 18,
      moq: 1,
      quantityMultiple: 1,
      priceSlabs: [],
    };
    // 1 @ 333 paise -> gst = round(333*0.18=59.94) = 60
    const line = computeLine(p, 1);
    expect(line.subtotalPaise).toBe(333);
    expect(line.gstPaise).toBe(60);
    expect(line.totalPaise).toBe(393);
  });
});
