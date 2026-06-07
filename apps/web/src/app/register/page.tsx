import Link from "next/link";
import { registerAction } from "@/server/actions";
import { SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role === "supplier" ? "supplier" : "customer";

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Create your account</h1>

        <div className="mt-3 flex rounded-lg border border-gray-200 p-1 text-sm">
          <Link
            href="/register?role=customer"
            className={`flex-1 rounded-md py-1.5 text-center font-semibold ${role === "customer" ? "bg-kiwi-600 text-white" : "text-gray-600"}`}
          >
            I&apos;m a Buyer
          </Link>
          <Link
            href="/register?role=supplier"
            className={`flex-1 rounded-md py-1.5 text-center font-semibold ${role === "supplier" ? "bg-kiwi-600 text-white" : "text-gray-600"}`}
          >
            I&apos;m a Supplier
          </Link>
        </div>

        {sp.error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</div>
        )}

        <form action={registerAction} className="mt-4 space-y-3">
          <input type="hidden" name="role" value={role} />
          <Field name="phone" label="Mobile number" placeholder="9000000050" required />
          {role === "supplier" ? (
            <>
              <Field name="companyName" label="Company name" required />
              <div>
                <label className="block text-xs font-medium text-gray-500">Business type</label>
                <select name="businessType" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="manufacturer">Manufacturer</option>
                  <option value="importer">Importer</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
              </div>
              <Field name="gstNumber" label="GST number" />
            </>
          ) : (
            <>
              <Field name="shopName" label="Shop / company name" required />
              <Field name="ownerName" label="Owner name" />
              <div>
                <label className="block text-xs font-medium text-gray-500">Business category</label>
                <select name="businessCategory" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="party_shop">Party shop</option>
                  <option value="decorator">Decorator</option>
                  <option value="event_planner">Event planner</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
              </div>
              <Field name="gstNumber" label="GST number" />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field name="city" label="City" />
            <Field name="state" label="State" />
          </div>
          <SubmitButton className="w-full">Create account</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {role === "supplier"
            ? "Suppliers are reviewed by admin before products go live."
            : "Already have an account? "}
          {role !== "supplier" && (
            <Link href="/login" className="font-semibold text-kiwi-600 hover:underline">
              Login
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
      />
    </div>
  );
}
