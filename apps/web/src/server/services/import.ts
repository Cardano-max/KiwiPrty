import { prisma } from "@/server/db";
import { parseCsv } from "@/domain/csv";
import { createProduct } from "@/server/services/suppliers";

export interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

/**
 * Bulk-import products from CSV (Excel → "Save as CSV"). Header columns:
 * name, category, price, unitLabel, moq, quantityMultiple, stock, gstPercent,
 * city, color, material, imageUrl, description. `category` matches a category
 * name or slug. Each row is validated; failures are reported per-row.
 */
export async function bulkImportProducts(supplierId: string, csvText: string): Promise<ImportResult> {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return { created: 0, errors: [{ row: 0, message: "No data rows found" }] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name.toLowerCase());

  const cats = await prisma.category.findMany();
  const findCat = (v: string) => {
    const t = v.trim().toLowerCase();
    return cats.find((c) => c.slug === t || c.name.toLowerCase() === t);
  };

  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (name: string) => {
      const i = col(name);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };
    const rowNum = r + 1; // 1-based incl. header

    const name = get("name");
    const catVal = get("category");
    const price = parseFloat(get("price"));

    if (!name) {
      errors.push({ row: rowNum, message: "missing name" });
      continue;
    }
    const cat = findCat(catVal);
    if (!cat) {
      errors.push({ row: rowNum, message: `unknown category "${catVal}"` });
      continue;
    }
    if (!(price > 0)) {
      errors.push({ row: rowNum, message: "invalid price" });
      continue;
    }

    try {
      await createProduct(supplierId, {
        name,
        categoryId: cat.id,
        basePricePaise: Math.round(price * 100),
        gstPercent: parseInt(get("gstpercent"), 10) || 18,
        moq: parseInt(get("moq"), 10) || 1,
        quantityMultiple: parseInt(get("quantitymultiple"), 10) || 1,
        stockQuantity: parseInt(get("stock"), 10) || 0,
        unitLabel: get("unitlabel") || "Piece",
        serviceCity: get("city") || undefined,
        color: get("color") || undefined,
        material: get("material") || undefined,
        imageUrl: get("imageurl") || undefined,
        description: get("description") || undefined,
      });
      created += 1;
    } catch (e) {
      errors.push({ row: rowNum, message: e instanceof Error ? e.message : "failed" });
    }
  }

  return { created, errors };
}
