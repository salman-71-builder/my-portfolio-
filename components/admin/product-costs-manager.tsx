"use client";

import * as React from "react";
import Image from "next/image";
import { Search, Check, RotateCcw, Loader2 } from "lucide-react";
import {
  DEFAULT_COST_RATIO,
  formatTaka,
  type CostMap,
} from "@/lib/finance";

export interface CostProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number; // base selling price (priceMin)
}

type RowState = "idle" | "saving" | "saved" | "error";

function estimatedCost(price: number) {
  return Math.round(price * DEFAULT_COST_RATIO);
}
function marginPct(price: number, cost: number) {
  return price > 0 ? ((price - cost) / price) * 100 : 0;
}

export function ProductCostsManager({
  products,
  initialCosts,
}: {
  products: CostProduct[];
  initialCosts: CostMap;
}) {
  const [costs, setCosts] = React.useState<CostMap>(initialCosts);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [states, setStates] = React.useState<Record<string, RowState>>({});
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  const exactCount = products.filter((p) => costs[p.id] != null).length;

  function setRowState(id: string, s: RowState) {
    setStates((prev) => ({ ...prev, [id]: s }));
    if (s === "saved") {
      setTimeout(
        () =>
          setStates((prev) =>
            prev[id] === "saved" ? { ...prev, [id]: "idle" } : prev
          ),
        1500
      );
    }
  }

  async function save(p: CostProduct) {
    const raw = drafts[p.id];
    if (raw == null || raw === "") return;
    const costPrice = Math.round(Number(raw));
    if (!Number.isFinite(costPrice) || costPrice < 0) return;
    if (costs[p.id] === costPrice) return; // unchanged
    setRowState(p.id, "saving");
    try {
      const res = await fetch("/api/admin/product-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, costPrice }),
      });
      if (!res.ok) throw new Error();
      setCosts((prev) => ({ ...prev, [p.id]: costPrice }));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      setRowState(p.id, "saved");
    } catch {
      setRowState(p.id, "error");
    }
  }

  async function clearOverride(p: CostProduct) {
    setRowState(p.id, "saving");
    try {
      const res = await fetch(`/api/admin/product-costs?productId=${p.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) throw new Error();
      setCosts((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      setRowState(p.id, "saved");
    } catch {
      setRowState(p.id, "error");
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Cost Prices</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{exactCount}</span> of{" "}
            {products.length} products have an exact cost. The rest use an
            estimate ({Math.round(DEFAULT_COST_RATIO * 100)}% of selling price).
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Product</th>
              <th className="py-2 pr-3 text-right font-medium">Selling</th>
              <th className="py-2 pr-3 text-right font-medium">Cost Price</th>
              <th className="py-2 pr-3 text-right font-medium">Profit / unit</th>
              <th className="py-2 pr-3 text-right font-medium">Margin</th>
              <th className="py-2 pr-0 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const override = costs[p.id];
              const isExact = override != null;
              const draft = drafts[p.id];
              const effectiveCost =
                draft != null && draft !== ""
                  ? Math.round(Number(draft))
                  : override ?? estimatedCost(p.price);
              const profit = p.price - effectiveCost;
              const margin = marginPct(p.price, effectiveCost);
              const state = states[p.id] ?? "idle";
              const dirty =
                draft != null && draft !== "" && Number(draft) !== override;

              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {formatTaka(p.price)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-muted-foreground">৳</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={draft ?? (override != null ? String(override) : "")}
                        placeholder={String(estimatedCost(p.price))}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") save(p);
                        }}
                        onBlur={() => dirty && save(p)}
                        className="h-8 w-24 rounded-md border bg-background px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </td>
                  <td
                    className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${
                      profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatTaka(profit)}
                  </td>
                  <td
                    className={`py-2.5 pr-3 text-right tabular-nums ${
                      margin >= 25
                        ? "text-green-600"
                        : margin < 10
                          ? "text-red-600"
                          : "text-foreground"
                    }`}
                  >
                    {margin.toFixed(0)}%
                  </td>
                  <td className="py-2.5 pr-0">
                    <div className="flex items-center justify-end gap-2">
                      {state === "saving" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : state === "saved" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <Check className="h-3.5 w-3.5" /> Saved
                        </span>
                      ) : state === "error" ? (
                        <button
                          onClick={() => save(p)}
                          className="text-xs font-medium text-red-600 underline"
                        >
                          Retry
                        </button>
                      ) : dirty ? (
                        <button
                          onClick={() => save(p)}
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white"
                        >
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                      ) : isExact ? (
                        <>
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            Exact
                          </span>
                          <button
                            onClick={() => clearOverride(p)}
                            aria-label="Reset to estimate"
                            title="Reset to estimate"
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Estimated
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No products match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
