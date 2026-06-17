"use client";

import * as React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  CheckCircle2,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subjects = [
  "General Inquiry",
  "Sourcing Request",
  "Become a Supplier",
  "Order Support",
  "Shipping & Delivery",
  "Partnership",
];

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="pb-12">
      <section className="bg-gradient-to-br from-brand-dark to-primary py-14 text-center text-white">
        <div className="container">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Get In Touch
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-200">
            Have a question or a sourcing request? Our team is here to help 24/7.
          </p>
        </div>
      </section>

      <div className="container grid gap-8 py-12 lg:grid-cols-3">
        {/* Info */}
        <div className="space-y-4">
          {[
            {
              icon: MapPin,
              title: "Office Address",
              lines: ["House 12, Road 5, Banani", "Dhaka 1213, Bangladesh"],
            },
            {
              icon: Phone,
              title: "Phone",
              lines: ["01700-000000", "01800-000000"],
            },
            {
              icon: Mail,
              title: "Email",
              lines: ["info@importchina.com.bd", "support@importchina.com.bd"],
            },
            {
              icon: Clock,
              title: "Working Hours",
              lines: ["Sat - Thu: 9 AM - 8 PM", "24/7 Online Support"],
            },
          ].map((c) => (
            <div
              key={c.title}
              className="flex gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm text-muted-foreground">
                    {l}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 p-4 font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <h2 className="text-2xl font-bold">Message Sent!</h2>
                <p className="text-muted-foreground">
                  Thank you for reaching out. Our team will respond within 24
                  hours.
                </p>
                <Button onClick={() => setSent(false)} variant="outline">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-xl font-bold">Send us a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" required placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="01XXXXXXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us about your sourcing needs…"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Map placeholder */}
          <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border bg-muted/40 text-center text-muted-foreground">
            <div>
              <MapPin className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 font-medium">Google Maps Embed</p>
              <p className="text-sm">Banani, Dhaka 1213, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
