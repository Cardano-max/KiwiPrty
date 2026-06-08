import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerId } from "@/server/session";
import { customerPurchaseReport } from "@/server/services/reports";
import { formatPaise } from "@/domain/money";

export const dynamic = "force-dynamic";

function Bar({ label, paise, max }: { label: string; paise: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((paise / max) * 100)) : 0;
  return (
    <div className="text-sm">
      <div className="flex justify-between">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold">{formatPaise(paise)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-kiwi-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login?next=/reports");
  const r = await customerPurchaseReport(customerId);
  const maxSupplier = Math.max(1, ...r.supplierBreakdown.map((s) => s.paise));
  const maxCategory = Math.max(1, ...r.categoryBreakdown.map((s) => s.paise));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/orders" className="text-sm text-kiwi-600 hover:underline">← Orders</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Purchase report</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-2xl font-extrabold text-kiwi-700">{r.totalOrders}</div>
          <div className="text-xs text-gray-500">Total orders</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-2xl font-extrabold text-kiwi-700">{formatPaise(r.totalSpendPaise)}</div>
          <div className="text-xs text-gray-500">Total spend (incl. GST)</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-bold">Spend by supplier</h2>
          {r.supplierBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {r.supplierBreakdown.map((s) => (
                <Bar key={s.name} label={s.name} paise={s.paise} max={maxSupplier} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-bold">Spend by category</h2>
          {r.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {r.categoryBreakdown.map((c) => (
                <Bar key={c.name} label={c.name} paise={c.paise} max={maxCategory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
