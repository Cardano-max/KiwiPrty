import { describe, it, expect } from "vitest";
import { fallbackDescription, fallbackParseSearch } from "./ai";

const cats = [
  { name: "Baby Shower", slug: "baby-shower" },
  { name: "Balloons", slug: "balloons" },
  { name: "LED Lights", slug: "led-lights" },
];
const cities = ["Mumbai", "Surat", "Delhi"];

describe("fallbackParseSearch", () => {
  it("extracts a price ceiling and category", () => {
    const r = fallbackParseSearch("baby shower decoration under ₹5000", cats, cities);
    expect(r.priceMaxPaise).toBe(500000);
    expect(r.categorySlug).toBe("baby-shower");
  });

  it("parses '5,000' with commas and 'below'", () => {
    const r = fallbackParseSearch("balloons below 1,200", cats, cities);
    expect(r.priceMaxPaise).toBe(120000);
    expect(r.categorySlug).toBe("balloons");
  });

  it("extracts a city", () => {
    const r = fallbackParseSearch("balloons in Surat", cats, cities);
    expect(r.city).toBe("Surat");
    expect(r.categorySlug).toBe("balloons");
  });

  it("detects clearance and new-arrival tags", () => {
    expect(fallbackParseSearch("clearance stock", cats, cities).tag).toBe("clearance");
    expect(fallbackParseSearch("latest new arrival kits", cats, cities).tag).toBe("new_arrival");
  });

  it("returns leftover keywords as terms", () => {
    const r = fallbackParseSearch("led lights", cats, cities);
    expect(r.categorySlug).toBe("led-lights");
    expect(r.source).toBe("fallback");
  });
});

describe("fallbackDescription", () => {
  it("includes the product name and category", () => {
    const text = fallbackDescription({
      name: "Balloon Decoration Kit",
      category: "Balloons",
      color: "Blue",
      material: "Latex",
      unitLabel: "Set",
    });
    expect(text).toContain("Balloon Decoration Kit");
    expect(text.toLowerCase()).toContain("balloons");
    expect(text).toContain("Blue Latex");
    expect(text.length).toBeGreaterThan(40);
  });

  it("handles missing optional fields gracefully", () => {
    const text = fallbackDescription({ name: "Mystery Item" });
    expect(text).toContain("Mystery Item");
    expect(text).toContain("party essential");
  });
});
