import { describe, it, expect } from "vitest";
import { formatPaise, rupeesToPaise, paiseToRupees } from "./money";
import { invoiceNumber } from "./invoice";
import { scoreLead } from "./leadScore";

describe("money", () => {
  it("formats paise with Indian grouping", () => {
    expect(formatPaise(0)).toBe("₹0");
    expect(formatPaise(120000)).toBe("₹1,200");
    expect(formatPaise(318600)).toBe("₹3,186");
    expect(formatPaise(12345)).toBe("₹123.45");
    expect(formatPaise(1000000000)).toBe("₹1,00,00,000"); // 1 crore, Indian grouping
  });

  it("converts rupees and paise", () => {
    expect(rupeesToPaise(12.5)).toBe(1250);
    expect(paiseToRupees(1250)).toBe(12.5);
  });
});

describe("invoiceNumber", () => {
  it("zero-pads a sequential number with year prefix", () => {
    expect(invoiceNumber(123, new Date("2026-06-07T00:00:00Z"))).toBe("KP-2026-000123");
    expect(invoiceNumber(1, new Date("2026-01-01T00:00:00Z"))).toBe("KP-2026-000001");
  });
});

describe("scoreLead", () => {
  it("scores a highly engaged buyer as hot", () => {
    expect(scoreLead({ productsViewed: 8, categoriesViewed: 3, inquiries: 2 })).toBe("hot");
  });
  it("scores a lightly engaged buyer as warm", () => {
    expect(scoreLead({ productsViewed: 4, categoriesViewed: 2 })).toBe("warm");
  });
  it("scores a barely engaged buyer as cold", () => {
    expect(scoreLead({ productsViewed: 1 })).toBe("cold");
  });
});
