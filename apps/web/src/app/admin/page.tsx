import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/server/session";
import { adminStats, listSuppliers, listCustomers } from "@/server/services/admin";
import { formatPaise } from "@/domain/money";
import { adminKycAction } from "@/server/actions";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-2xl font-extrabold text-kiwi-700">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function KycButtons({ kind, id }: { kind: "supplier" | "customer"; id: string }) {
  return (
    <div className="flex gap-1">
      <form action={adminKycAction}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="approved" />
        <button className="rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
          Approve
        </button>
      </form>
      <form action={adminKycAction}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="rejected" />
        <button className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
          Reject
        </button>
      </form>
    </div>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login?next=/admin");

  const [stats, suppliers, customers] = await Promise.all([
    adminStats(),
    listSuppliers(),
    listCustomers(),
  ]);

  const pendingSuppliers = suppliers.filter((s) => s.kycStatus !== "approved" && s.kycStatus !== "rejected");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Link href="/admin/disputes" className="text-sm font-semibold text-kiwi-600 hover:underline">
          Support tickets →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Suppliers" value={String(stats.suppliers)} />
        <Stat label="Customers" value={String(stats.customers)} />
        <Stat label="Active products" value={String(stats.activeProducts)} />
        <Stat label="GMV" value={formatPaise(stats.gmvPaise)} />
        <Stat label="Sub. revenue" value={formatPaise(stats.subscriptionRevenuePaise)} />
        <Stat label="Pending KYC" value={String(stats.pendingSuppliers + stats.pendingCustomers)} />
      </div>

      {pendingSuppliers.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 font-bold text-amber-800">Suppliers awaiting approval</h2>
          <div className="space-y-2">
            {pendingSuppliers.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm">
                <div>
                  <div className="font-semibold">{s.companyName}</div>
                  <div className="text-xs text-gray-500">
                    {s.businessType} · {s.city ?? "—"} · GST {s.gstNumber ?? "—"} · {s.user.phone}
                  </div>
                </div>
                <KycButtons kind="supplier" id={s.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-bold">All suppliers</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">Company</th>
              <th className="py-2">Type</th>
              <th className="py-2">City</th>
              <th className="py-2">Products</th>
              <th className="py-2">KYC</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-2 font-medium">{s.companyName}</td>
                <td className="py-2">{s.businessType}</td>
                <td className="py-2">{s.city ?? "—"}</td>
                <td className="py-2">{s._count.products}</td>
                <td className="py-2">
                  <Badge tone={s.kycStatus === "approved" ? "green" : s.kycStatus === "rejected" ? "gray" : "amber"}>
                    {s.kycStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-bold">Customers</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">Shop</th>
              <th className="py-2">Category</th>
              <th className="py-2">City</th>
              <th className="py-2">KYC</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="py-2 font-medium">{c.shopName}</td>
                <td className="py-2">{c.businessCategory}</td>
                <td className="py-2">{c.city ?? "—"}</td>
                <td className="py-2">
                  <Badge tone={c.kycStatus === "approved" ? "green" : "amber"}>{c.kycStatus}</Badge>
                </td>
                <td className="py-2 text-right">
                  {c.kycStatus !== "approved" && <KycButtons kind="customer" id={c.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
