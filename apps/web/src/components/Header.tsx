import Link from "next/link";
import { currentUser, getCustomerId } from "@/server/session";
import { cartCount } from "@/server/services/cart";
import { logoutAction } from "@/server/actions";

export default async function Header() {
  const user = await currentUser();
  let count = 0;
  if (user?.role === "customer") {
    const customerId = await getCustomerId();
    if (customerId) count = await cartCount(customerId);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎈</span>
          <span className="text-xl font-extrabold">
            <span className="text-kiwi-600">Kiwi</span> <span className="text-party-pink">Party</span>
          </span>
        </Link>

        <form action="/products" className="ml-2 hidden flex-1 md:block">
          <input
            name="q"
            placeholder="Search products, themes, suppliers…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-kiwi-400"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 text-sm font-medium">
          <Link href="/products" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            Marketplace
          </Link>
          <Link href="/stories" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            Stories
          </Link>

          {(!user || user.role === "customer") && (
            <Link href="/cart" className="relative rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              Cart
              {count > 0 && (
                <span className="absolute -right-0 -top-0 rounded-full bg-party-pink px-1.5 text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user?.role === "customer" && (
            <Link href="/orders" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              Orders
            </Link>
          )}
          {user?.role === "supplier" && (
            <Link href="/supplier" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              Admin
            </Link>
          )}

          {user ? (
            <form action={logoutAction}>
              <button className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100">Logout</button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-kiwi-600 px-3 py-2 font-semibold text-white hover:bg-kiwi-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
