import Link from "next/link";
import { getPlans } from "@/server/services/subscriptions";
import { currentUser } from "@/server/session";
import { parseList } from "@/server/mappers";
import { formatPaise } from "@/domain/money";
import { subscribeAction } from "@/server/actions";
import { SubmitButton, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; subscribed?: string }>;
}) {
  const sp = await searchParams;
  const [plans, user] = await Promise.all([getPlans(), currentUser()]);
  const role = user?.role;
  const planStatus = user?.customer?.planStatus ?? user?.supplier?.planStatus;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Membership plans</h1>
      <p className="mt-1 text-sm text-gray-500">
        Verified suppliers and buyers subscribe to access the marketplace.
      </p>

      {sp.subscribed && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          🎉 You&apos;re subscribed — your membership is now active.
        </div>
      )}
      {sp.error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {plans.map((p) => {
          const features = parseList(p.features);
          const isMine =
            (p.audience === "supplier" && role === "supplier") ||
            (p.audience === "customer" && role === "customer");
          const active = isMine && planStatus === "active";
          return (
            <div key={p.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
              <Badge tone={p.audience === "supplier" ? "kiwi" : "amber"}>
                {p.audience === "supplier" ? "For Suppliers" : "For Buyers"}
              </Badge>
              <h2 className="mt-2 text-lg font-bold">{p.name}</h2>
              <div className="mt-1 text-2xl font-extrabold text-kiwi-700">
                {formatPaise(p.pricePaise)}{" "}
                <span className="text-sm font-normal text-gray-500">+ GST / {p.interval}</span>
              </div>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-gray-700">
                {features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <div className="mt-4">
                {isMine ? (
                  active ? (
                    <Badge tone="green">Active ✓</Badge>
                  ) : (
                    <form action={subscribeAction}>
                      <SubmitButton className="w-full">Subscribe (mock payment)</SubmitButton>
                    </form>
                  )
                ) : !user ? (
                  <Link
                    href={`/register?role=${p.audience}`}
                    className="inline-block rounded-lg border border-kiwi-300 px-4 py-2 text-sm font-semibold text-kiwi-700 hover:bg-kiwi-50"
                  >
                    Sign up as {p.audience}
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">For {p.audience} accounts</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Payments are mocked in this demo. Production wires Razorpay subscription mandates.
      </p>
    </div>
  );
}
