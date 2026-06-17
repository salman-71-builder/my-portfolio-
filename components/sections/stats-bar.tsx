const stats = [
  { value: "10,000+", label: "Products" },
  { value: "500+", label: "Verified Suppliers" },
  { value: "50,000+", label: "Happy Buyers" },
  { value: "5–15 Days", label: "Delivery Time" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-white">
      <div className="container grid grid-cols-2 gap-4 py-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-extrabold text-brand sm:text-3xl lg:text-4xl">
              {s.value}
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
