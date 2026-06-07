import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupplierId } from "@/server/session";
import { listCategories } from "@/server/services/catalog";
import { createProductAction } from "@/server/actions";
import { SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/products/new");
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">← Dashboard</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Add product</h1>

      {sp.error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
      )}

      <form action={createProductAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-xs font-medium text-gray-500">Product name *</label>
          <input name="name" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">Category *</label>
            <select name="categoryId" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Unit label</label>
            <input name="unitLabel" defaultValue="Set" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">Price (₹) *</label>
            <input name="price" type="number" step="0.01" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">GST %</label>
            <input name="gstPercent" type="number" defaultValue={18} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Stock</label>
            <input name="stockQuantity" type="number" defaultValue={100} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">MOQ</label>
            <input name="moq" type="number" defaultValue={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Quantity multiple</label>
            <input name="quantityMultiple" type="number" defaultValue={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">Ships from (city)</label>
            <input name="serviceCity" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Colour</label>
            <input name="color" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Image URL</label>
          <input name="imageUrl" placeholder="https://…" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Description</label>
          <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <SubmitButton>Create product</SubmitButton>
      </form>
    </div>
  );
}
