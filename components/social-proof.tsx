"use client";

import * as React from "react";
import { ShoppingBag, X } from "lucide-react";

/* Names + cities for the live "just ordered" popups. */
const NAMES = [
  "Ahmed",
  "Rahim",
  "Karim",
  "Fatima",
  "Nusrat",
  "Tanvir",
  "Sadia",
  "Imran",
  "Mehedi",
  "Sumaiya",
  "Arif",
  "Jannat",
];
const CITIES = [
  "Dhaka",
  "Chittagong",
  "Khulna",
  "Sylhet",
  "Rajshahi",
  "Barishal",
  "Comilla",
  "Mymensingh",
  "Gazipur",
  "Narayanganj",
];
const PRODUCTS = [
  "Wireless Earbuds",
  "Smart Watch",
  "LED Strip Lights",
  "Phone Case Bundle",
  "Sunglasses (50 pcs)",
  "Kitchen Gadgets",
  "Bluetooth Speaker",
  "Office Chair",
  "Power Bank (100 pcs)",
  "Sneakers (Bulk)",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type Popup = {
  id: number;
  name: string;
  city: string;
  product: string;
  mins: number;
};

/**
 * Live social-proof layer: rotating "just ordered" toasts (bottom-left) plus a
 * floating live-visitor counter. Pure client-side simulation — no PII, no network.
 */
export function SocialProof() {
  const [popup, setPopup] = React.useState<Popup | null>(null);
  const [viewers, setViewers] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // seed live viewer count and drift it gently
    setViewers(180 + Math.floor(Math.random() * 120));
    const viewerTimer = setInterval(() => {
      setViewers((v) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.min(420, Math.max(120, v + delta));
      });
    }, 3500);

    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      setPopup({
        id: ++idRef.current,
        name: rand(NAMES),
        city: rand(CITIES),
        product: rand(PRODUCTS),
        mins: 1 + Math.floor(Math.random() * 12),
      });
      hideTimer = setTimeout(() => setPopup(null), 5000);
    };

    // first popup after a short delay, then on an interval
    const first = setTimeout(show, 4000);
    const loop = setInterval(show, 11000);

    return () => {
      clearInterval(viewerTimer);
      clearInterval(loop);
      clearTimeout(first);
      clearTimeout(hideTimer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <>
      {/* live viewer counter */}
      {viewers > 0 && (
        <div className="no-print pointer-events-none fixed bottom-20 right-3 z-30 flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-md lg:bottom-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span>
            <span className="text-primary">{viewers}</span> people viewing now
          </span>
        </div>
      )}

      {/* just-ordered popup */}
      {popup && (
        <div
          key={popup.id}
          className="no-print fixed bottom-20 left-3 z-30 flex max-w-[19rem] animate-[fadeInUp_0.4s_ease] items-start gap-3 rounded-xl border bg-background p-3 text-foreground shadow-lg lg:bottom-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm leading-snug">
              <span className="font-bold text-foreground">{popup.name}</span> from{" "}
              {popup.city} just ordered
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {popup.product}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {popup.mins} min ago · ✅ Verified order
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="absolute right-1.5 top-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
