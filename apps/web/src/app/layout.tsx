import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PWARegister from "@/components/PWARegister";
import { getSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Kiwi Party — AI Party Supplies B2B Marketplace",
  description:
    "India's AI-powered party supplies B2B marketplace. Search, compare and order from verified suppliers.",
  applicationName: "Kiwi Party",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Kiwi Party" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#6b2fe6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSession();
  const accountHref = s
    ? s.role === "supplier"
      ? "/supplier"
      : s.role === "admin"
        ? "/admin"
        : "/orders"
    : "/login";
  const accountLabel = s ? "Account" : "Login";

  return (
    <html lang="en">
      <body className="min-h-screen pb-16 antialiased sm:pb-0">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        <footer className="no-print border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
            <div className="mb-2 flex justify-center gap-4">
              <Link href="/feedback" className="hover:text-kiwi-600">Feedback</Link>
              <Link href="/disputes" className="hover:text-kiwi-600">Support</Link>
              <Link href="/rfq" className="hover:text-kiwi-600">RFQ</Link>
              <Link href="/pricing" className="hover:text-kiwi-600">Pricing</Link>
            </div>
            Kiwi Party — Search Smart, Sell Smart, Grow Smart 🎉
          </div>
        </footer>
        <BottomNav accountHref={accountHref} accountLabel={accountLabel} />
        <PWARegister />
      </body>
    </html>
  );
}
