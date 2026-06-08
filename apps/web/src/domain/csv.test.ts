import { describe, it, expect } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("parses a simple table", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas", () => {
    expect(parseCsv('name,desc\n"Balloon Kit","red, blue, gold"')).toEqual([
      ["name", "desc"],
      ["Balloon Kit", "red, blue, gold"],
    ]);
  });

  it("handles escaped quotes and newlines inside quotes", () => {
    const rows = parseCsv('a\n"he said ""hi""\nline2"');
    expect(rows[1][0]).toBe('he said "hi"\nline2');
  });

  it("handles CRLF and trailing newline", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("drops empty rows", () => {
    expect(parseCsv("a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});
