import Link from "next/link";
import { parseList } from "@/server/mappers";

const TAG_LABELS: Record<string, { label: string; cls: string }> = {
  new_arrival: { label: "New", cls: "bg-emerald-100 text-emerald-700" },
  best_match: { label: "Best Match", cls: "bg-kiwi-100 text-kiwi-700" },
  top_rated: { label: "Top Rated", cls: "bg-amber-100 text-amber-700" },
  trending: { label: "Trending", cls: "bg-pink-100 text-pink-700" },
  clearance: { label: "Clearance", cls: "bg-red-100 text-red-700" },
  fast_moving: { label: "Fast Moving", cls: "bg-blue-100 text-blue-700" },
  "festival:diwali": { label: "Diwali", cls: "bg-orange-100 text-orange-700" },
};

export function Tag({ tag }: { tag: string }) {
  const t = TAG_LABELS[tag] ?? { label: tag, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.cls}`}>{t.label}</span>
  );
}

export function TagList({ tags }: { tags: string | string[] }) {
  const list = Array.isArray(tags) ? tags : parseList(tags);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {list.slice(0, 3).map((t) => (
        <Tag key={t} tag={t} />
      ))}
    </div>
  );
}

export function Badge({ children, tone = "kiwi" }: { children: React.ReactNode; tone?: "kiwi" | "green" | "gray" | "amber" }) {
  const tones: Record<string, string> = {
    kiwi: "bg-kiwi-100 text-kiwi-700",
    green: "bg-emerald-100 text-emerald-700",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Stars({ value, className = "text-sm" }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={className} aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="text-amber-500">{"★".repeat(full)}</span>
      <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg bg-kiwi-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-kiwi-700"
    >
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger";
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary: "bg-kiwi-600 text-white hover:bg-kiwi-700",
    outline: "border border-kiwi-300 text-kiwi-700 hover:bg-kiwi-50",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="submit"
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
