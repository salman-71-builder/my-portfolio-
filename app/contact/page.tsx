import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Import China. Visit our Dhaka office, call us, or message us on WhatsApp for wholesale sourcing support.",
};

const info = [
  {
    icon: MapPin,
    title: "Office Address",
    lines: ["House 12, Road 7, Gulshan-1", "Dhaka 1212, Bangladesh"],
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
    lines: ["Sat–Thu: 9:00 AM – 8:00 PM", "Friday: Closed"],
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="gradient-brand py-14 text-white">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Have a question about sourcing, shipping or becoming a supplier? Our
            team is here to help.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Info */}
          <div className="space-y-4">
            {info.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    {item.lines.map((l) => (
                      <p key={l} className="text-sm text-muted-foreground">
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}

            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-2xl border shadow-sm">
          <div className="relative flex h-72 items-center justify-center bg-muted">
            <iframe
              title="Import China office location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=90.40%2C23.77%2C90.43%2C23.80&layer=mapnik"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
