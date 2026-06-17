"use client";

import * as React from "react";
import { Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("@")) setDone(true);
  }

  return (
    <section className="bg-gradient-to-br from-brand-dark via-[#660000] to-primary py-14 text-white">
      <div className="container max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <Mail className="h-7 w-7 text-brand-gold" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
          Get Weekly Deals &amp; Updates
        </h2>
        <p className="mt-2 text-gray-200">
          Subscribe to receive the hottest wholesale offers straight to your
          inbox.
        </p>

        {done ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 font-semibold text-brand-gold">
            <CheckCircle2 className="h-5 w-5" />
            Thanks for subscribing!
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="h-12 border-0 bg-white text-foreground"
            />
            <Button type="submit" size="lg" variant="gold" className="shrink-0">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
