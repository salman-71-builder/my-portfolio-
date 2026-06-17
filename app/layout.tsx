import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://importchina.com.bd"),
  title: {
    default: "Import China — Bangladesh's #1 B2B Wholesale Sourcing Platform",
    template: "%s | Import China",
  },
  description:
    "Source wholesale products directly from China and save up to 60%. 10,000+ products, 500+ verified suppliers, 5-15 day delivery to Bangladesh.",
  keywords: [
    "wholesale Bangladesh",
    "China sourcing",
    "B2B Bangladesh",
    "import China",
    "alibaba Bangladesh",
  ],
  openGraph: {
    title: "Import China — Wholesale Sourcing from China to Bangladesh",
    description:
      "Bangladesh's #1 B2B wholesale sourcing platform. Save up to 60%.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
