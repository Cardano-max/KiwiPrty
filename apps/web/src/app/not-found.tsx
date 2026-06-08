import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-5xl">🎈</div>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you&apos;re looking for has floated away.</p>
      <Link href="/" className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white">
        Back to marketplace
      </Link>
    </div>
  );
}
