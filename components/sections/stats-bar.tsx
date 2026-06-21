import { CountUp } from "@/components/count-up";

const stats = [
  { value: 10000, suffix: "+", label: "Products" },
  { value: 500, suffix: "+", label: "Verified Suppliers" },
  { value: 50000, suffix: "+", label: "Happy Buyers" },
  { value: null as number | null, text: "5–15 Days", label: "Delivery Time" },
];

export function StatsBar() {
  return (
    <section className="border-y bg-secondary">
      <div className="container grid grid-cols-2 gap-4 py-10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">
              {s.value !== null ? (
                <CountUp value={s.value} suffix={s.suffix} />
              ) : (
                s.text
              )}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
