import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiwi Party — AI Party Supplies Marketplace",
  description:
    "India's AI-powered party supplies B2B marketplace. Search, compare and order from verified suppliers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
