import {
  Factory,
  FileCheck2,
  ShipWheel,
  Truck,
  PlaneTakeoff,
  BadgeDollarSign,
} from "lucide-react";

const ITEMS = [
  { icon: Factory, title: "Direct from factories", sub: "No middlemen, factory prices" },
  { icon: FileCheck2, title: "No import license needed", sub: "We handle the paperwork" },
  { icon: ShipWheel, title: "Customs cleared for you", sub: "Hassle-free clearance" },
  { icon: Truck, title: "Door-to-door delivery", sub: "Anywhere in Bangladesh" },
  { icon: PlaneTakeoff, title: "Air & Sea shipping", sub: "Fast or affordable" },
  { icon: BadgeDollarSign, title: "Lowest price guarantee", sub: "Or we match it" },
];

export function TrustBar() {
  return (
    <section className="rounded-md border bg-card p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.title}
              className="group flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors hover:bg-secondary"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-navy transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-semibold leading-tight">{it.title}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {it.sub}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
