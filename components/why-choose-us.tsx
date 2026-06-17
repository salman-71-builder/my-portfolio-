import {
  ShieldCheck,
  CreditCard,
  Truck,
  Headphones,
  RotateCcw,
  BadgeDollarSign,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    desc: "Every supplier is vetted and quality-checked before listing.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    desc: "Pay safely with bKash, Nagad, cards or bank transfer.",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    desc: "Door-to-door delivery to Bangladesh in just 5-15 days.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Our Bangla-speaking team is always ready to help.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Hassle-free returns and refund protection on every order.",
  },
  {
    icon: BadgeDollarSign,
    title: "Competitive Prices",
    desc: "Factory-direct pricing — save up to 60% vs. local markets.",
  },
];

export function WhyChooseUs() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="group flex gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <f.icon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
