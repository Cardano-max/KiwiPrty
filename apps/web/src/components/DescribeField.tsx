"use client";

import { useState } from "react";

export default function DescribeField() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  async function generate() {
    const byId = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    const name = (byId("name") as HTMLInputElement)?.value || "";
    const sel = byId("categoryId") as HTMLSelectElement | null;
    const category = sel ? sel.options[sel.selectedIndex]?.text : undefined;
    const color = (byId("color") as HTMLInputElement)?.value || undefined;
    const unitLabel = (byId("unitLabel") as HTMLInputElement)?.value || undefined;

    setLoading(true);
    try {
      const r = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, category, color, unitLabel }),
      });
      const d = await r.json();
      if (d.text) {
        setValue(d.text);
        setSource(d.source ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-500">Description</label>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="text-xs font-semibold text-kiwi-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Generating…" : "✨ Generate with AI"}
        </button>
      </div>
      <textarea
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-kiwi-400"
      />
      {source === "fallback" && (
        <p className="mt-1 text-[11px] text-gray-400">
          Generated locally. Set ANTHROPIC_API_KEY to generate with Claude.
        </p>
      )}
      {source === "ai" && <p className="mt-1 text-[11px] text-emerald-500">Generated with Claude ✨</p>}
    </div>
  );
}
