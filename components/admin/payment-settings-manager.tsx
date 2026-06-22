"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentSettings } from "@/lib/payment-settings";

export function PaymentSettingsManager({ initial }: { initial: PaymentSettings }) {
  const [s, setS] = React.useState<PaymentSettings>(initial);
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof PaymentSettings>(k: K, v: PaymentSettings[K]) {
    setS((p) => ({ ...p, [k]: v }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  const toggles: { key: keyof PaymentSettings; label: string }[] = [
    { key: "bkashEnabled", label: "bKash" },
    { key: "nagadEnabled", label: "Nagad" },
    { key: "rocketEnabled", label: "Rocket" },
    { key: "bankEnabled", label: "Bank Transfer" },
  ];
  const numbers: { key: keyof PaymentSettings; label: string }[] = [
    { key: "bkashNumber", label: "bKash merchant number" },
    { key: "nagadNumber", label: "Nagad merchant number" },
    { key: "rocketNumber", label: "Rocket number" },
  ];
  const bank: { key: keyof PaymentSettings; label: string }[] = [
    { key: "bankName", label: "Bank name" },
    { key: "bankAccountName", label: "Account name" },
    { key: "bankAccountNumber", label: "Account number" },
    { key: "bankBranch", label: "Branch" },
    { key: "bankRouting", label: "Routing number" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* advance rule */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <h2 className="text-base font-bold">Advance Rule</h2>
        <div className="mt-3 flex items-center gap-3">
          <Label htmlFor="minadv">Minimum advance %</Label>
          <Input
            id="minadv"
            type="number"
            min={0}
            max={100}
            value={s.minAdvancePct}
            onChange={(e) => set("minAdvancePct", Math.round(Number(e.target.value)) as PaymentSettings["minAdvancePct"])}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">
            Customers must pay at least this % upfront; the rest is COD (no full COD).
          </span>
        </div>
      </div>

      {/* enabled methods */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <h2 className="mb-3 text-base font-bold">Enabled Methods</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {toggles.map((t) => (
            <label key={t.key} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(s[t.key])}
                onChange={(e) => set(t.key, e.target.checked as PaymentSettings[typeof t.key])}
                className="accent-primary"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* merchant numbers */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <h2 className="mb-3 text-base font-bold">Merchant Numbers</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {numbers.map((n) => (
            <label key={n.key} className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{n.label}</span>
              <Input
                value={(s[n.key] as string) ?? ""}
                onChange={(e) => set(n.key, e.target.value as PaymentSettings[typeof n.key])}
                placeholder="01XXXXXXXXX"
              />
            </label>
          ))}
        </div>
      </div>

      {/* bank details */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <h2 className="mb-3 text-base font-bold">Bank Transfer Details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bank.map((f) => (
            <label key={f.key} className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</span>
              <Input
                value={(s[f.key] as string) ?? ""}
                onChange={(e) => set(f.key, e.target.value as PaymentSettings[typeof f.key])}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border bg-card/95 p-3 backdrop-blur soft-shadow">
        {state === "error" && <span className="text-sm text-red-600">Save failed — DB connected?</span>}
        {state === "saved" && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <Button onClick={save} disabled={state === "saving"}>
          {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: automated bKash/Nagad PGW activates when merchant API credentials
        (env) + egress are configured (see <code>lib/payment-gateway.ts</code>).
        Until then, customers pay to these numbers and enter the TrxID, which you
        verify on the order page.
      </p>
    </div>
  );
}
