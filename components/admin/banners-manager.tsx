"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  Check,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/lib/banners";

type Draft = {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
};

const emptyDraft: Draft = {
  imageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "",
  ctaHref: "",
};

export function BannersManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = React.useState<Banner[]>(initialBanners);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [adding, setAdding] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  async function add() {
    if (!draft.imageUrl.trim()) {
      alert("Please paste an image URL for the banner.");
      return;
    }
    setBusy("add");
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.banner) throw new Error();
      setBanners((b) => [...b, data.banner]);
      setDraft(emptyDraft);
      setAdding(false);
    } catch {
      alert("Could not add banner (is the database connected?).");
    } finally {
      setBusy(null);
    }
  }

  async function patch(id: string, fields: Partial<Banner>) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      if (!res.ok) throw new Error();
      setBanners((b) => b.map((x) => (x.id === id ? { ...x, ...fields } : x)));
    } catch {
      alert("Could not save changes.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBanners((b) => b.filter((x) => x.id !== id));
    } catch {
      alert("Could not delete.");
    } finally {
      setBusy(null);
    }
  }

  function reordered(from: number, to: number): Banner[] {
    const next = [...banners];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  /** Apply a new order locally and persist sortOrder=index for changed rows. */
  async function commitOrder(next: Banner[]) {
    setBanners(next.map((b, i) => ({ ...b, sortOrder: i })));
    setBusy("order");
    try {
      await Promise.all(
        next
          .map((b, i) =>
            b.sortOrder !== i
              ? fetch("/api/admin/banners", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: b.id, sortOrder: i }),
                })
              : null
          )
          .filter(Boolean) as Promise<Response>[]
      );
    } catch {
      alert("Could not save the new order.");
    } finally {
      setBusy(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= banners.length) return;
    await commitOrder(reordered(index, j));
  }

  function handleDrop(target: number) {
    if (dragIndex === null || dragIndex === target) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = reordered(dragIndex, target);
    setDragIndex(null);
    setOverIndex(null);
    commitOrder(next);
  }

  function field(k: keyof Draft, label: string, placeholder: string) {
    return (
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
        <input
          value={draft[k]}
          onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border bg-background px-2 text-sm"
        />
      </label>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {banners.length} banner{banners.length !== 1 ? "s" : ""}
          {busy === "order" && (
            <span className="inline-flex items-center gap-1 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> saving order…
            </span>
          )}
        </p>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add banner
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="mb-3 text-base font-bold">New banner</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("imageUrl", "Image URL", "https://… (hosted image)")}
            {field("ctaHref", "Button link", "/products?category=electronics")}
            {field("title", "Title overlay", "Wholesale from China")}
            {field("ctaText", "Button text", "Shop now")}
            {field("subtitle", "Subtitle", "Door-to-door delivery in Bangladesh")}
          </div>
          {draft.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.imageUrl} alt="preview" className="h-32 w-full object-cover" />
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Paste a hosted image URL (your CDN, Cloudinary, imgbb, etc.). Recommended
            size ~1600×500. Direct file upload needs a blob-storage provider.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={add} disabled={busy === "add"}>
              {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save banner
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setDraft(emptyDraft); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {banners.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-3 h-10 w-10" />
          No banners yet — the homepage shows default slides. Add your first banner.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Drag the <GripVertical className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
            handle to reorder, or use the arrows.
          </p>
          {banners.map((b, i) => (
            <div
              key={b.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={() => handleDrop(i)}
              className={`flex flex-col gap-3 rounded-2xl border bg-card p-3 soft-shadow transition-all sm:flex-row sm:items-center ${
                dragIndex === i ? "opacity-50" : ""
              } ${overIndex === i && dragIndex !== null && dragIndex !== i ? "ring-2 ring-navy" : ""}`}
            >
              {/* drag handle */}
              <button
                type="button"
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                aria-label="Drag to reorder"
                className="hidden shrink-0 cursor-grab self-stretch items-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing sm:flex"
              >
                <GripVertical className="h-5 w-5" />
              </button>

              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-40">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt={b.title ?? "banner"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.title || "(no title)"}</p>
                <p className="truncate text-sm text-muted-foreground">{b.subtitle || "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {b.ctaText ? `${b.ctaText} → ${b.ctaHref || "—"}` : "no button"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || busy === b.id}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === banners.length - 1 || busy === b.id}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => patch(b.id, { active: !b.active })}
                  disabled={busy === b.id}
                  className={`rounded p-1.5 hover:bg-muted ${b.active ? "text-green-600" : "text-muted-foreground"}`}
                  aria-label="Toggle active"
                  title={b.active ? "Active" : "Hidden"}
                >
                  {b.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => remove(b.id)}
                  disabled={busy === b.id}
                  className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  {busy === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
