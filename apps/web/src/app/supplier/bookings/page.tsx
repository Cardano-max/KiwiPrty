import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupplierId } from "@/server/session";
import { listSupplierBookings } from "@/server/services/bookings";
import { setBookingStatusAction } from "@/server/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["requested", "confirmed", "fulfilled", "cancelled"];

export default async function SupplierBookingsPage() {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/bookings");
  const bookings = await listSupplierBookings(supplierId);

  return (
    <div>
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">← Dashboard</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Advance bookings</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No advance bookings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{b.product.name}</div>
                  <div className="text-xs text-gray-500">
                    {b.customer.shopName} · qty {b.quantity}
                    {b.expectedDate ? ` · by ${new Date(b.expectedDate).toLocaleDateString("en-IN")}` : ""}
                  </div>
                  {b.note ? <div className="mt-1 text-sm text-gray-600">“{b.note}”</div> : null}
                </div>
              </div>
              <form action={setBookingStatusAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="bookingId" value={b.id} />
                <select name="status" defaultValue={b.status} className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="rounded-lg border border-kiwi-300 px-3 py-1 text-sm font-semibold text-kiwi-700 hover:bg-kiwi-50">
                  Update
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
