"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const MOODS = [
  { emoji: "🎉", label: "Celebrating", q: "party decoration lights gift", color: "from-pink-500 to-rose-500" },
  { emoji: "🏠", label: "Decorating Home", q: "home decoration lamp furniture", color: "from-amber-500 to-orange-500" },
  { emoji: "💼", label: "Starting a Business", q: "wholesale bestseller popular", color: "from-blue-600 to-indigo-600" },
  { emoji: "🎁", label: "Buying Gifts", q: "gift watch jewellery", color: "from-fuchsia-500 to-purple-600" },
  { emoji: "💰", label: "Saving Money", q: "budget deal cheap", color: "from-green-600 to-emerald-600" },
  { emoji: "✨", label: "Treating Myself", q: "beauty fragrance premium", color: "from-yellow-500 to-amber-500" },
];

export function MoodShopping() {
  return (
    <section className="container py-12 sm:py-16">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            How are you feeling today? 😊
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a mood and we&apos;ll find the perfect products for you.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MOODS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
            >
              <Link
                href={`/products?q=${encodeURIComponent(m.q)}`}
                className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${m.color} p-4 text-center text-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-sm font-bold leading-tight">{m.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
