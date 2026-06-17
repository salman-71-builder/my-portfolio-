import { Package, Users, Smile, Truck } from "lucide-react";

const stats = [
  { icon: Package, value: "10,000+", label: "Products" },
  { icon: Users, value: "500+", label: "Verified Suppliers" },
  { icon: Smile, value: "50,000+", label: "Happy Buyers" },
  { icon: Truck, value: "5-15 Days", label: "Delivery" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-secondary/20">
      <div className="container grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-center gap-3 text-center lg:justify-start lg:text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-none sm:text-xl">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
