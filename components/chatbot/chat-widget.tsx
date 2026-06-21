"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatBDT, cn } from "@/lib/utils";
import type { Product } from "@/data/products";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  products?: Product[];
  ts: number;
}

const STORAGE_KEY = "chinacart-chat-v1";

const QUICK_REPLIES = [
  "🔥 Trending Products",
  "💰 Best Deals",
  "🎁 Gift Ideas",
  "📱 Phone Accessories",
  "🏠 Home & Furniture",
  "👗 Fashion & Clothing",
  "🤖 Talk to Human",
];

const GREETING: ChatMessage = {
  id: "greeting",
  role: "bot",
  text: "Hi! I'm CartBot 🤖 — your ChinaCart shopping assistant. Tell me what you need (English or Bangla), e.g. \"amar ekta cheap sofa lagbe\". How can I help? 😊",
  ts: Date.now(),
};

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatProductCard({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  return (
    <div className="flex gap-2 rounded-lg border bg-white p-2 shadow-sm">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${product.id}`}
          onClick={onClose}
          className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-900 hover:text-brand"
        >
          {product.name}
        </Link>
        <span className="mt-0.5 text-xs font-bold text-brand">
          {formatBDT(product.priceMin)}
        </span>
        <div className="mt-auto flex gap-1 pt-1">
          <button
            onClick={() => addItem(product)}
            className="inline-flex items-center gap-1 rounded bg-brand px-2 py-1 text-[10px] font-semibold text-white hover:bg-brand-800"
          >
            <ShoppingCart className="h-3 w-3" /> Add
          </button>
          <Link
            href={`/products/${product.id}`}
            onClick={onClose}
            className="rounded border px-2 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-muted"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // load history (session)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;

    // local intercept: talk to human
    if (/talk to human|🤖 talk to human/i.test(content)) {
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: content, ts: Date.now() };
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        text: "No problem! 🙋 Our team is on WhatsApp at +880 1700-000000, or use the Contact page. They'll help you right away!",
        ts: Date.now(),
      };
      setMessages((m) => [...m, userMsg, botMsg]);
      setInput("");
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: content, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: data.reply || "Here's what I found! 🛍️",
          products: Array.isArray(data.products) ? data.products : [],
          ts: Date.now(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: "Sorry, I'm having trouble right now. Please try again in a moment. 🙏",
          ts: Date.now(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function clearChat() {
    setMessages([{ ...GREETING, ts: Date.now() }]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open ChinaCart AI Assistant"
        className="no-print fixed bottom-20 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-gold-600 text-white shadow-xl ring-2 ring-gold transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
        {!open && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-0 z-[120] flex flex-col bg-[#0a1230] text-white sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:max-h-[80vh] sm:w-[380px] sm:rounded-2xl sm:shadow-2xl lg:bottom-24"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 rounded-t-2xl bg-gradient-to-r from-brand to-brand-800 p-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Bot className="h-5 w-5 text-gold" />
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-brand bg-green-500" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">ChinaCart AI Assistant</p>
                  <p className="flex items-center gap-1 text-[11px] text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> CartBot · Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} aria-label="Clear chat" className="rounded p-1.5 hover:bg-white/15">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1.5 hover:bg-white/15">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#0a1230] p-3">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow",
                      m.role === "user"
                        ? "rounded-br-sm bg-gold text-black"
                        : "rounded-bl-sm bg-white/10 text-white"
                    )}
                  >
                    {m.text}
                  </div>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 grid w-[85%] gap-2">
                      {m.products.map((p) => (
                        <ChatProductCard key={p.id} product={p} onClose={() => setOpen(false)} />
                      ))}
                    </div>
                  )}
                  <span className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-white/40">
                    {timeLabel(m.ts)}
                    {m.role === "user" && <span className="text-blue-300">✓✓</span>}
                  </span>
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/10 px-3 py-2.5 w-fit">
                  <span className="ar-scan-dot" />
                  <span className="ar-scan-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="ar-scan-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-white/10 px-3 py-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/85 hover:border-gold hover:text-gold"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 rounded-b-2xl border-t border-white/10 bg-[#0a1230] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CartBot anything…"
                className="flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-black disabled:opacity-50"
              >
                {typing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
