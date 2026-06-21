"use client";

import * as React from "react";
import { Save, Check, RotateCcw, Plane, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RATE_FIELDS,
  DEFAULT_RATES,
  DELIVERY_TIME,
  type ShippingRates,
} from "@/lib/shipping";

export function ShippingRatesManager({
  initialRates,
}: {
  initialRates: ShippingRates;
}) {
  const [rates, setRates] = React.useState<ShippingRates>(initialRates);
  const [dirty, setDirty] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  function setRate(key: string, value: string) {
    setRates((r) => ({ ...r, [key]: value === "" ? 0 : Math.round(Number(value)) }));
    setDirty(true);
    setState("idle");
  }

  function resetDefaults() {
    setRates({ ...DEFAULT_RATES });
    setDirty(true);
    setState("idle");
  }

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: rates }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      setDirty(false);
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
    }
  }

  // group fields by their group label, in declaration order
  const groups: Record<string, typeof RATE_FIELDS> = {};
  for (const f of RATE_FIELDS) (groups[f.group] ??= []).push(f);

  return (
    <div className="mt-6 space-y-6">
      {/* delivery times note */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 soft-shadow">
          <Plane className="h-6 w-6 text-navy" />
          <div>
            <p className="font-semibold">By Air</p>
            <p className="text-sm text-muted-foreground">
              Faster · {DELIVERY_TIME.air}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 soft-shadow">
          <Ship className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold">By Ship</p>
            <p className="text-sm text-muted-foreground">
              Cheaper · {DELIVERY_TIME.ship}
            </p>
          </div>
        </div>
      </div>

      {Object.entries(groups).map(([group, fields]) => (
        <div key={group} className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="mb-3 text-base font-bold">{group}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <label key={f.key} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
                <span className="text-sm">{f.label}</span>
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min={0}
                    value={rates[f.key] ?? 0}
                    onChange={(e) => setRate(f.key, e.target.value)}
                    className="h-8 w-20 rounded-md border bg-background px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs text-muted-foreground">/kg</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* sticky action bar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border bg-card/95 p-3 backdrop-blur soft-shadow">
        {state === "error" && (
          <span className="text-sm text-red-600">Save failed — DB connected?</span>
        )}
        {state === "saved" && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <Button variant="outline" size="sm" onClick={resetDefaults}>
          <RotateCcw className="h-4 w-4" /> Reset to defaults
        </Button>
        <Button size="sm" onClick={save} disabled={!dirty || state === "saving"}>
          <Save className="h-4 w-4" /> {state === "saving" ? "Saving…" : "Save rates"}
        </Button>
      </div>
    </div>
  );
}
