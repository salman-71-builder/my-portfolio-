import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteIntro } from "@/components/site-intro";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { FlashMob } from "@/components/flash-mob";
import { SocialProof } from "@/components/social-proof";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Import China — Bangladesh's #1 B2B Wholesale Sourcing Platform",
    template: "%s | Import China",
  },
  description:
    "Source wholesale products directly from verified suppliers in China. Save up to 60% with transparent BDT pricing and 5–15 day delivery across Bangladesh.",
  keywords: [
    "wholesale Bangladesh",
    "import from China",
    "B2B sourcing",
    "Alibaba alternative",
    "bulk products Bangladesh",
  ],
  metadataBase: new URL("https://importchina.com.bd"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <CartProvider>
          <WishlistProvider>
            <SiteIntro />
            <Navbar />
            <main id="main-content" className="pb-16 lg:pb-0">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <MobileBottomNav />
            <ChatWidget />
            <FlashMob />
            <SocialProof />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
