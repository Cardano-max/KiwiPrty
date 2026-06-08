"use client";

import { useState } from "react";
import Link from "next/link";

interface Result {
  created: number;
  errors: { row: number; message: string }[];
}

const COLUMNS =
  "name, category, price, unitLabel, moq, quantityMultiple, stock, gstPercent, city, color, material, imageUrl, description";

export default function ImportProductsPage() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setCsv(await f.text());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!csv.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/supplier/products/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error || "Import failed");
      else setResult(d);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/supplier" className="text-sm text-kiwi-600 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold">Bulk import products (CSV)</h1>
      <p className="mb-4 text-sm text-gray-500">
        Export your Excel sheet as <b>CSV</b>, then upload or paste it. Columns: {COLUMNS}.{" "}
        <a href="/templates/products-sample.csv" download className="text-kiwi-600 hover:underline">
          Download sample
        </a>
        .
      </p>

      <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="block w-full text-sm"
        />
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder="…or paste CSV here"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-kiwi-400"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-kiwi-600 px-4 py-2 text-sm font-semibold text-white hover:bg-kiwi-700 disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import products"}
        </button>
      </form>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {result && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            ✓ Imported {result.created} product{result.created === 1 ? "" : "s"}.
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 text-sm">
              <b>{result.errors.length} row(s) skipped:</b>
              <ul className="mt-1 list-inside list-disc text-gray-600">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/supplier" className="mt-3 inline-block text-sm text-kiwi-600 hover:underline">
            Back to dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
