import { Check, X, Minus } from "lucide-react";

type Cell = "yes" | "no" | "mid";

const ROWS: { label: string; chinacart: Cell; traditional: Cell; local: Cell }[] = [
  { label: "Factory-direct pricing", chinacart: "yes", traditional: "mid", local: "no" },
  { label: "No import license needed", chinacart: "yes", traditional: "no", local: "yes" },
  { label: "Customs cleared for you", chinacart: "yes", traditional: "no", local: "yes" },
  { label: "Air & Sea shipping options", chinacart: "yes", traditional: "mid", local: "no" },
  { label: "Low MOQ flexibility", chinacart: "yes", traditional: "no", local: "mid" },
  { label: "Door-to-door in Bangladesh", chinacart: "yes", traditional: "no", local: "yes" },
  { label: "Bengali support & BDT pricing", chinacart: "yes", traditional: "no", local: "yes" },
];

function Mark({ v }: { v: Cell }) {
  if (v === "yes")
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Check className="h-4 w-4" />
      </span>
    );
  if (v === "no")
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X className="h-4 w-4" />
      </span>
    );
  return (
    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
      <Minus className="h-4 w-4" />
    </span>
  );
}

export function WhyChinaCart() {
  return (
    <section className="rounded-md border bg-card p-5">
      <div className="text-center">
        <h2 className="text-xl font-bold sm:text-2xl">Why ChinaCart is the best choice</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare importing with ChinaCart vs the traditional way.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left font-medium text-muted-foreground"></th>
              <th className="py-3 text-center">
                <span className="rounded-md bg-navy px-3 py-1 font-bold text-white">
                  ChinaCart
                </span>
              </th>
              <th className="py-3 text-center font-semibold text-muted-foreground">
                Traditional importing
              </th>
              <th className="py-3 text-center font-semibold text-muted-foreground">
                Local retail
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-b last:border-0">
                <td className="py-3 pr-3 font-medium">{r.label}</td>
                <td className="py-3 text-center"><Mark v={r.chinacart} /></td>
                <td className="py-3 text-center"><Mark v={r.traditional} /></td>
                <td className="py-3 text-center"><Mark v={r.local} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
