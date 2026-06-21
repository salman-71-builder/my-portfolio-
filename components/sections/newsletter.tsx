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
    <section className="rounded-2xl border bg-secondary p-8 sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Get Weekly Deals &amp; Updates
        </h2>
        <p className="mt-3 text-muted-foreground">
          Join 50,000+ buyers and never miss a flash deal or new arrival.
        </p>

        {done ? (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-foreground">
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
              className="h-12 bg-background"
            />
            <Button type="submit" size="lg" className="shrink-0">
              <Send className="h-4 w-4" /> Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
