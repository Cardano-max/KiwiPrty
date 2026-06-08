import Link from "next/link";
import { loginAction } from "@/server/actions";
import { SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in with your mobile number and OTP.</p>

        {sp.error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
        )}

        <form action={loginAction} className="mt-4 space-y-3">
          {sp.next && <input type="hidden" name="next" value={sp.next} />}
          <div>
            <label className="block text-xs font-medium text-gray-500">Mobile number</label>
            <input
              name="phone"
              required
              placeholder="9000000001"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">OTP</label>
            <input
              name="otp"
              required
              placeholder="123456"
              defaultValue="123456"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
            />
          </div>
          <SubmitButton className="w-full">Login</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-kiwi-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-kiwi-200 bg-kiwi-50 p-4 text-sm text-kiwi-800">
        <div className="font-semibold">Demo accounts (OTP: 123456)</div>
        <ul className="mt-1 space-y-0.5">
          <li>🛍️ Buyer: <b>9000000001</b></li>
          <li>🏭 Supplier: <b>9000000010</b></li>
          <li>🛠️ Admin: <b>9000000099</b></li>
        </ul>
      </div>
    </div>
  );
}
