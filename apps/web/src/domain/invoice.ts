// GST invoice numbering. One sequential, immutable number per SupplierOrder.

/** Build an invoice number like "KP-2026-000123" from a sequence and date. */
export function invoiceNumber(seq: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  return `KP-${year}-${String(seq).padStart(6, "0")}`;
}
