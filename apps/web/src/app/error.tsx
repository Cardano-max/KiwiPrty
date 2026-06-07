"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, send to an error tracker (e.g. Sentry — see docs/02 §10).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-5xl">🎊</div>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-4 inline-block rounded-lg bg-kiwi-600 px-4 py-2 font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
