"use client";

import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subjects = [
  "General Inquiry",
  "Product Sourcing",
  "Become a Supplier",
  "Order Support",
  "Partnership",
];

export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <h3 className="text-xl font-bold">Message Sent!</h3>
        <p className="text-sm text-muted-foreground">
          Thank you for reaching out. Our team will get back to you within 24
          hours.
        </p>
        <Button onClick={() => setSent(false)} variant="outline">
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required className="mt-1.5" placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            className="mt-1.5"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className="mt-1.5"
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <select
            id="subject"
            className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          required
          rows={5}
          placeholder="How can we help you?"
          className="mt-1.5 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <Send className="h-4 w-4" /> Send Message
      </Button>
    </form>
  );
}
