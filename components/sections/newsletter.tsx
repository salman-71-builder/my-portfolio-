"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  }

  return (
    <section className="relative overflow-hidden rounded-2xl gradient-brand p-8 text-white sm:p-12">
      <div className="absolute inset-0 bg-chinese-pattern opacity-50" />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Get Weekly Deals &amp; Updates
        </h2>
        <p className="mt-2 text-white/80">
          Join 50,000+ buyers and never miss a flash deal or new arrival.
        </p>

        {done ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
            <CheckCircle2 className="h-5 w-5 text-gold" />
            <span className="font-medium">
              You&apos;re subscribed! Check your inbox.
            </span>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="h-12 border-0 bg-white text-foreground"
            />
            <Button type="submit" variant="gold" size="lg" className="shrink-0">
              <Send className="h-4 w-4" /> Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
