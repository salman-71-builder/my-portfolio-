"use client";

import * as React from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EXPENSE_CATEGORIES,
  expenseLabel,
  expenseColor,
  formatTaka,
  type ExpenseRow,
} from "@/lib/finance";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseManager({
  expenses,
  onChange,
}: {
  expenses: ExpenseRow[];
  onChange: (next: ExpenseRow[]) => void;
}) {
  const [adding, setAdding] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [category, setCategory] = React.useState<string>("product_cost");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [note, setNote] = React.useState("");

  function resetForm() {
    setCategory("product_cost");
    setAmount("");
    setDate(todayISO());
    setNote("");
    setAdding(false);
    setEditId(null);
  }

  function startEdit(e: ExpenseRow) {
    setEditId(e.id);
    setAdding(false);
    setCategory(e.category);
    setAmount(String(e.amount));
    setDate(e.date.slice(0, 10));
    setNote(e.note ?? "");
  }

  async function submit() {
    const amt = Math.round(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) return;
    setBusy(true);
    const payload = { category, amount: amt, date, note: note || null };
    try {
      if (editId) {
        const res = await fetch("/api/admin/expenses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        if (!res.ok) throw new Error();
        onChange(
          expenses.map((e) =>
            e.id === editId
              ? { ...e, ...payload, date: new Date(date).toISOString() }
              : e
          )
        );
      } else {
        const res = await fetch("/api/admin/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.id) throw new Error();
        onChange([
          {
            id: data.id,
            category,
            amount: amt,
            note: note || null,
            date: new Date(date).toISOString(),
          },
          ...expenses,
        ]);
      }
      resetForm();
    } catch {
      alert(
        "Could not save the expense. Make sure the database is connected (DATABASE_URL)."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this expense?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/expenses?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onChange(expenses.filter((e) => e.id !== id));
    } catch {
      alert("Could not delete the expense.");
    } finally {
      setBusy(false);
    }
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const form = (
    <div className="grid gap-2 rounded-xl border bg-secondary/50 p-3 sm:grid-cols-[1fr_1fr_1fr_2fr_auto]">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-9 rounded-md border bg-background px-2 text-sm"
        aria-label="Expense category"
      >
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount ৳"
        className="h-9 rounded-md border bg-background px-2 text-sm"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-9 rounded-md border bg-background px-2 text-sm"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="h-9 rounded-md border bg-background px-2 text-sm"
      />
      <div className="flex gap-1">
        <Button size="sm" onClick={submit} disabled={busy}>
          <Check className="h-4 w-4" /> Save
        </Button>
        <Button size="sm" variant="ghost" onClick={resetForm} disabled={busy}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Expense Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Total logged: <span className="font-semibold">{formatTaka(total)}</span>
          </p>
        </div>
        {!adding && !editId && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        )}
      </div>

      {adding && <div className="mt-4">{form}</div>}

      <div className="mt-4 overflow-x-auto">
        {expenses.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No expenses yet. Add your first expense to track costs.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Note</th>
                <th className="py-2 pr-3 text-right font-medium">Amount</th>
                <th className="py-2 pr-0 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) =>
                editId === e.id ? (
                  <tr key={e.id}>
                    <td colSpan={5} className="py-2">
                      {form}
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: expenseColor(e.category) }}
                        />
                        {expenseLabel(e.category)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {e.note || "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-red-600">
                      −{formatTaka(e.amount)}
                    </td>
                    <td className="py-2.5 pr-0">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(e)}
                          aria-label="Edit"
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(e.id)}
                          aria-label="Delete"
                          className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
