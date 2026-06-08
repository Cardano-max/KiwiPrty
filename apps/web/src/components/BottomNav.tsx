"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/products", label: "Search", icon: "🔍" },
  { href: "/stories", label: "Stories", icon: "🎈" },
  { href: "/cart", label: "Cart", icon: "🛒" },
];

export default function BottomNav({ accountHref, accountLabel }: { accountHref: string; accountLabel: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const all = [...tabs, { href: accountHref, label: accountLabel, icon: "👤" }];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-md">
        {all.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.label}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-kiwi-700" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
