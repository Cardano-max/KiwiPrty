"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  name: string;
  slug: string;
  pricePaise: number;
  unitLabel: string;
  supplier: string;
}
interface Msg {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! I'm the Kiwi Party AI sourcing assistant. Tell me what you're looking for — e.g. \"balloon arch for a baby shower\" or \"Diwali decoration under ₹500\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const d = await r.json();
      setMessages((m) => [...m, { role: "assistant", text: d.text ?? "Sorry, try again.", products: d.products }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">🤖 AI Sourcing Assistant</h1>
      <p className="mb-4 text-sm text-gray-500">
        Ask in plain language; I&apos;ll find matching products from verified suppliers.
      </p>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-kiwi-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.text}
            </div>
            {m.products && m.products.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.products.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    {p.name} · ₹{(p.pricePaise / 100).toFixed(0)}/{p.unitLabel}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400">Thinking…</div>}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you sourcing today?"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-kiwi-400"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-kiwi-600 px-5 py-2 text-sm font-semibold text-white hover:bg-kiwi-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
