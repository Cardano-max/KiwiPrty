import Link from "next/link";
import { getCustomerId } from "@/server/session";
import { listFavorites } from "@/server/services/favorites";
import ProductCard from "@/components/ProductCard";
import { toggleFavoriteAction } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const customerId = await getCustomerId();
  if (!customerId) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Your wishlist</h1>
        <p className="mt-2 text-gray-600">Log in as a buyer to save products.</p>
        <Link href="/login?next=/wishlist" className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white">
          Login
        </Link>
      </div>
    );
  }

  const favorites = await listFavorites(customerId);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your wishlist</h1>
      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Nothing saved yet.{" "}
          <Link href="/products" className="text-kiwi-600 hover:underline">
            Browse products
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((f) => (
            <div key={f.id}>
              <ProductCard product={f.product} />
              <form action={toggleFavoriteAction} className="mt-1 text-center">
                <input type="hidden" name="productId" value={f.productId} />
                <input type="hidden" name="redirectTo" value="/wishlist" />
                <button className="text-xs text-red-500 hover:underline">Remove</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
