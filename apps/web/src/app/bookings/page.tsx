import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerId } from "@/server/session";
import { listCustomerBookings } from "@/server/services/bookings";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login?next=/bookings");
  const bookings = await listCustomerBookings(customerId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Advance bookings</h1>
        <Link href="/orders" className="text-sm font-semibold text-kiwi-600 hover:underline">
          Orders →
        </Link>
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No advance bookings yet. Pre-book a product from its page.
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{b.product.name}</span>
                <Badge tone={b.status === "fulfilled" ? "green" : b.status === "cancelled" ? "gray" : "kiwi"}>
                  {b.status}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {b.supplier.companyName} · qty {b.quantity}
                {b.expectedDate ? ` · needed by ${new Date(b.expectedDate).toLocaleDateString("en-IN")}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
