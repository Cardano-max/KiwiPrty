import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Kiwi Party — AI Party Supplies B2B Marketplace",
  description:
    "India's AI-powered party supplies B2B marketplace. Search, compare and order from verified suppliers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
            Kiwi Party — Search Smart, Sell Smart, Grow Smart 🎉 · MVP demo build
          </div>
        </footer>
      </body>
    </html>
  );
}
