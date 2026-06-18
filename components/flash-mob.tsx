"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

const SESSION_KEY = "chinacart-flashmob-shown";
const DURATION = 10 * 60; // 10 minutes in seconds

export function FlashMob() {
  const [open, setOpen] = React.useState(false);
  const [remaining, setRemaining] = React.useState(DURATION);
  const [discount] = React.useState(() => [60, 70, 80, 90][Math.floor(Math.random() * 4)]);

  React.useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const delay = 22000 + Math.random() * 18000; // 22–40s after load
    const id = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
      fireConfetti(2200);
    }, delay);
    return () => clearTimeout(id);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setOpen(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-24 left-1/2 z-[130] w-[92vw] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-gold bg-[#0a0604] p-5 text-center text-white shadow-2xl sm:bottom-6 sm:left-6 sm:translate-x-0"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-2 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-gold text-black">
            <Zap className="h-7 w-7 fill-current" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-gradient-gold">
            ⚡ FLASH MOB!
          </h3>
          <p className="mt-1 text-lg font-bold">
            {discount}% OFF for the next
          </p>
          <p className="my-2 text-4xl font-extrabold tabular-nums text-gold">
            {mm}:{ss}
          </p>
          <p className="text-xs text-white/70">
            🔥 First 50 customers only — don&apos;t miss out!
          </p>
          <Link
            href="/products?sort=deals"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gold py-2.5 font-bold text-black transition-transform hover:scale-[1.02]"
          >
            Grab the Deals →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
