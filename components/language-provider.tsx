"use client";

import * as React from "react";

export type Lang = "en" | "bn";

/** Compact bilingual dictionary for the chrome (nav, footer, common actions). */
const DICT: Record<string, { en: string; bn: string }> = {
  search_placeholder: { en: "Search ChinaCart", bn: "চায়নাকার্টে খুঁজুন" },
  search: { en: "Search", bn: "খুঁজুন" },
  all: { en: "All", bn: "সব" },
  all_categories: { en: "All Categories", bn: "সব ক্যাটাগরি" },
  deliver_to_bd: { en: "Deliver to Bangladesh", bn: "বাংলাদেশে ডেলিভারি" },
  hello_signin: { en: "Hello, sign in", bn: "হ্যালো, সাইন ইন" },
  account_lists: { en: "Account & Lists", bn: "অ্যাকাউন্ট ও লিস্ট" },
  returns_orders: { en: "Returns & Orders", bn: "রিটার্ন ও অর্ডার" },
  cart: { en: "Cart", bn: "কার্ট" },
  login: { en: "Login", bn: "লগইন" },
  register: { en: "Register", bn: "রেজিস্টার" },
  wishlist: { en: "Wishlist", bn: "উইশলিস্ট" },
  todays_deals: { en: "Today's Deals", bn: "আজকের ডিল" },
  best_sellers: { en: "Best Sellers", bn: "বেস্ট সেলার" },
  new_arrivals: { en: "New Arrivals", bn: "নতুন পণ্য" },
  electronics: { en: "Electronics", bn: "ইলেকট্রনিক্স" },
  fashion: { en: "Fashion", bn: "ফ্যাশন" },
  home_kitchen: { en: "Home & Kitchen", bn: "হোম ও কিচেন" },
  customer_service: { en: "Customer Service", bn: "কাস্টমার সার্ভিস" },
  add_to_cart: { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  buy_now: { en: "Buy Now", bn: "এখনই কিনুন" },
  back_to_top: { en: "Back to top", bn: "উপরে ফিরে যান" },
  recently_viewed: { en: "Recently viewed", bn: "সম্প্রতি দেখা" },
};

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
}

const Ctx = React.createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    const saved = localStorage.getItem("cc_lang") as Lang | null;
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("cc_lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = React.useCallback(
    (key: string) => DICT[key]?.[lang] ?? DICT[key]?.en ?? key,
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LanguageCtx {
  const ctx = React.useContext(Ctx);
  if (ctx) return ctx;
  // safe fallback if used outside provider
  return { lang: "en", setLang: () => {}, t: (k: string) => DICT[k]?.en ?? k };
}
