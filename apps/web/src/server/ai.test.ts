import { describe, it, expect } from "vitest";
import { fallbackDescription } from "./ai";

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
