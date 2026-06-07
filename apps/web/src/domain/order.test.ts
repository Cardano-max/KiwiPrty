import { describe, it, expect } from "vitest";
import { splitCartIntoSupplierOrders, type CartLine } from "./order";
import type { ProductPricing } from "./pricing";

const flat = (price: number, gst = 18): ProductPricing => ({
  basePricePaise: price,
  gstPercent: gst,
  moq: 1,
  quantityMultiple: 1,
  priceSlabs: [],
});

describe("splitCartIntoSupplierOrders", () => {
  it("groups items by supplier into separate supplier orders", () => {
    const lines: CartLine[] = [
      { productId: "p1", productName: "Balloons", supplierId: "sA", quantity: 10, pricing: flat(1000) },
      { productId: "p2", productName: "Curtain", supplierId: "sB", quantity: 5, pricing: flat(2000) },
      { productId: "p3", productName: "LED", supplierId: "sA", quantity: 2, pricing: flat(5000) },
    ];
    const split = splitCartIntoSupplierOrders(lines);
    expect(split.supplierOrders).toHaveLength(2);

    const a = split.supplierOrders.find((o) => o.supplierId === "sA")!;
    const b = split.supplierOrders.find((o) => o.supplierId === "sB")!;
    expect(a.items).toHaveLength(2);
    expect(b.items).toHaveLength(1);
  });

  it("computes per-supplier subtotal, GST and total", () => {
    const lines: CartLine[] = [
      // sA: 10*1000=10000 sub, +1800 gst ; 2*5000=10000 sub, +1800 gst => 20000 sub, 3600 gst, 23600 total
      { productId: "p1", productName: "Balloons", supplierId: "sA", quantity: 10, pricing: flat(1000) },
      { productId: "p3", productName: "LED", supplierId: "sA", quantity: 2, pricing: flat(5000) },
      // sB: 5*2000=10000 sub, +1800 gst => 11800 total
      { productId: "p2", productName: "Curtain", supplierId: "sB", quantity: 5, pricing: flat(2000) },
    ];
    const split = splitCartIntoSupplierOrders(lines);
    const a = split.supplierOrders.find((o) => o.supplierId === "sA")!;
    const b = split.supplierOrders.find((o) => o.supplierId === "sB")!;

    expect(a.subtotalPaise).toBe(20000);
    expect(a.gstPaise).toBe(3600);
    expect(a.totalPaise).toBe(23600);

    expect(b.subtotalPaise).toBe(10000);
    expect(b.gstPaise).toBe(1800);
    expect(b.totalPaise).toBe(11800);
  });

  it("computes parent totals as the sum of supplier orders", () => {
    const lines: CartLine[] = [
      { productId: "p1", productName: "Balloons", supplierId: "sA", quantity: 10, pricing: flat(1000) },
      { productId: "p3", productName: "LED", supplierId: "sA", quantity: 2, pricing: flat(5000) },
      { productId: "p2", productName: "Curtain", supplierId: "sB", quantity: 5, pricing: flat(2000) },
    ];
    const split = splitCartIntoSupplierOrders(lines);
    expect(split.subtotalPaise).toBe(30000);
    expect(split.gstPaise).toBe(5400);
    expect(split.totalPaise).toBe(35400);
  });

  it("handles a single-supplier cart", () => {
    const lines: CartLine[] = [
      { productId: "p1", productName: "Balloons", supplierId: "sA", quantity: 10, pricing: flat(1000) },
    ];
    const split = splitCartIntoSupplierOrders(lines);
    expect(split.supplierOrders).toHaveLength(1);
    expect(split.totalPaise).toBe(11800);
  });

  it("handles an empty cart", () => {
    const split = splitCartIntoSupplierOrders([]);
    expect(split.supplierOrders).toHaveLength(0);
    expect(split.totalPaise).toBe(0);
  });

  it("applies slab pricing within the split", () => {
    const tiered: ProductPricing = {
      basePricePaise: 1200,
      gstPercent: 18,
      moq: 100,
      quantityMultiple: 100,
      priceSlabs: [
        { minQty: 100, maxQty: 299, unitPricePaise: 1000 },
        { minQty: 300, maxQty: null, unitPricePaise: 900 },
      ],
    };
    const split = splitCartIntoSupplierOrders([
      { productId: "p1", productName: "Balloons", supplierId: "sA", quantity: 300, pricing: tiered },
    ]);
    // 300 @ ₹9 = 270000 sub, gst 48600, total 318600
    expect(split.supplierOrders[0].items[0].unitPricePaise).toBe(900);
    expect(split.totalPaise).toBe(318600);
  });
});
