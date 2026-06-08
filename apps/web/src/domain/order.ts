// Multi-supplier order split: one buyer checkout with items from several suppliers
// becomes one SupplierOrder per supplier (each fulfils, invoices and is paid
// separately) under a single parent Order. See docs/03 §B.

import { computeLine, type ProductPricing } from "./pricing";

export interface CartLine {
  productId: string;
  productName: string;
  supplierId: string;
  quantity: number;
  pricing: ProductPricing;
}

export interface DraftOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaise: number;
  gstPercent: number;
  lineSubtotalPaise: number;
  lineGstPaise: number;
  lineTotalPaise: number;
}

export interface DraftSupplierOrder {
  supplierId: string;
  items: DraftOrderItem[];
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
}

export interface OrderSplit {
  supplierOrders: DraftSupplierOrder[];
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
}

/**
 * Group cart lines by supplier and compute per-supplier and parent totals.
 * Supplier order grouping is stable in first-seen order.
 */
export function splitCartIntoSupplierOrders(lines: CartLine[]): OrderSplit {
  const bySupplier = new Map<string, DraftSupplierOrder>();

  for (const line of lines) {
    const c = computeLine(line.pricing, line.quantity);
    const item: DraftOrderItem = {
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      unitPricePaise: c.unitPricePaise,
      gstPercent: line.pricing.gstPercent,
      lineSubtotalPaise: c.subtotalPaise,
      lineGstPaise: c.gstPaise,
      lineTotalPaise: c.totalPaise,
    };

    let so = bySupplier.get(line.supplierId);
    if (!so) {
      so = { supplierId: line.supplierId, items: [], subtotalPaise: 0, gstPaise: 0, totalPaise: 0 };
      bySupplier.set(line.supplierId, so);
    }
    so.items.push(item);
    so.subtotalPaise += c.subtotalPaise;
    so.gstPaise += c.gstPaise;
    so.totalPaise += c.totalPaise;
  }

  const supplierOrders = [...bySupplier.values()];
  return {
    supplierOrders,
    subtotalPaise: supplierOrders.reduce((s, o) => s + o.subtotalPaise, 0),
    gstPaise: supplierOrders.reduce((s, o) => s + o.gstPaise, 0),
    totalPaise: supplierOrders.reduce((s, o) => s + o.totalPaise, 0),
  };
}
