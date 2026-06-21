"use client";

import * as React from "react";
import { UploadCloud, Trash2, Check, Loader2, RotateCcw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LOGO_SLOTS,
  logoFor,
  hexToHslTriplet,
  DEFAULT_PRIMARY,
  DEFAULT_NAVY,
  type Branding,
  type LogoSlot,
} from "@/lib/branding";

const ACCEPT = "image/png,image/svg+xml,image/jpeg,image/webp";
const MAX_BYTES = 3 * 1024 * 1024; // 3MB (data-URL storage limit)

function readAsDataURL(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function DropZone({
  slot,
  label,
  hint,
  value,
  onChange,
}: {
  slot: LogoSlot;
  label: string;
  hint: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function handle(file: File) {
    setErr(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setErr("Use PNG, SVG, JPG or WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Max 3MB. Please use a smaller file.");
      return;
    }
    setProgress(0);
    try {
      const dataUrl = await readAsDataURL(file, setProgress);
      onChange(dataUrl);
    } catch {
      setErr("Could not read the file.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-4 soft-shadow">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {value && (
          <button
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 rounded p-1 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handle(f);
        }}
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          over ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="max-h-20 max-w-full object-contain" />
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">Drag your logo here or click to browse</p>
            <p className="text-[11px] text-muted-foreground">PNG, SVG, JPG, WEBP · transparent PNG recommended · ≤3MB</p>
          </>
        )}
        {progress !== null && (
          <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function BrandingManager({ initial }: { initial: Branding }) {
  const [b, setB] = React.useState<Branding>(initial);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [darkPreview, setDarkPreview] = React.useState(false);

  function setLogo(slot: LogoSlot, v: string | null) {
    setB((prev) => ({ ...prev, [slot]: v }));
    setSaved(false);
  }

  // live colour preview on the admin page itself
  function setColor(key: "primaryColor" | "navyColor", hex: string) {
    setB((prev) => ({ ...prev, [key]: hex }));
    setSaved(false);
    const triplet = hexToHslTriplet(hex);
    if (triplet) {
      document.documentElement.style.setProperty(
        key === "primaryColor" ? "--primary" : "--navy",
        triplet
      );
    }
  }

  function resetColors() {
    setColor("primaryColor", DEFAULT_PRIMARY);
    setColor("navyColor", DEFAULT_NAVY);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainLogo: b.mainLogo,
          iconLogo: b.iconLogo,
          footerLogo: b.footerLogo,
          loadingLogo: b.loadingLogo,
          invoiceLogo: b.invoiceLogo,
          primaryColor: b.primaryColor,
          navyColor: b.navyColor,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(`Could not save: ${(e as Error).message}. Is the database connected?`);
    } finally {
      setSaving(false);
    }
  }

  const navy = b.navyColor;

  return (
    <div className="mt-6 space-y-8">
      {/* live previews */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Live Preview</h2>
          <button
            onClick={() => setDarkPreview((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            {darkPreview ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {darkPreview ? "Light bg" : "Dark bg"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* navbar */}
          <PreviewCard title="Navbar">
            <div className="flex items-center gap-3 rounded-md px-3 py-2" style={{ background: navy }}>
              <LogoImg src={logoFor(b, "mainLogo")} h={28} fallbackText />
              <span className="ml-auto text-xs text-white/70">Search · Cart</span>
            </div>
          </PreviewCard>

          {/* hero */}
          <PreviewCard title="Homepage hero (large)">
            <div className={`flex items-center justify-center rounded-md py-6 ${darkPreview ? "bg-[#0f1d3d]" : "bg-secondary"}`}>
              <LogoImg src={logoFor(b, "mainLogo")} h={56} dark={darkPreview} fallbackText big />
            </div>
          </PreviewCard>

          {/* footer */}
          <PreviewCard title="Footer">
            <div className="flex items-center rounded-md px-3 py-3" style={{ background: navy }}>
              <LogoImg src={logoFor(b, "footerLogo")} h={24} fallbackText />
            </div>
          </PreviewCard>

          {/* loading */}
          <PreviewCard title="Loading screen">
            <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-[#0f1d3d] py-6">
              <LogoImg src={logoFor(b, "loadingLogo")} h={40} dark fallbackText />
              <Loader2 className="h-5 w-5 animate-spin text-white/70" />
            </div>
          </PreviewCard>

          {/* invoice */}
          <PreviewCard title="Invoice / receipt">
            <div className="rounded-md border bg-white px-4 py-3">
              <LogoImg src={logoFor(b, "invoiceLogo")} h={32} fallbackText />
              <p className="mt-1 text-[10px] text-neutral-500">INVOICE #A1B2C3D4</p>
            </div>
          </PreviewCard>

          {/* favicon */}
          <PreviewCard title="Favicon (browser tab)">
            <div className="flex items-center gap-2 rounded-t-md border border-b-0 bg-muted px-3 py-2">
              <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-sm bg-white">
                {logoFor(b, "iconLogo") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoFor(b, "iconLogo")!} alt="favicon" className="h-4 w-4 object-contain" />
                ) : (
                  <span className="text-[8px] font-bold text-primary">C</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">ChinaCart</span>
            </div>
          </PreviewCard>
        </div>
      </div>

      {/* upload zones */}
      <div>
        <h2 className="mb-3 text-base font-bold">Upload Logos</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Each version is optional — if a slot is empty the Main Logo is used.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LOGO_SLOTS.map((s) => (
            <DropZone
              key={s.key}
              slot={s.key}
              label={s.label}
              hint={s.hint}
              value={b[s.key]}
              onChange={(v) => setLogo(s.key, v)}
            />
          ))}
        </div>
      </div>

      {/* brand colors */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Brand Colours</h2>
          <button onClick={resetColors} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Navy (primary brand)" value={b.navyColor} onChange={(v) => setColor("navyColor", v)} />
          <ColorField label="Orange-red (accent / CTA)" value={b.primaryColor} onChange={(v) => setColor("primaryColor", v)} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Colours preview live on this page and apply site-wide after you save.
        </p>
      </div>

      {/* save bar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border bg-card/95 p-3 backdrop-blur soft-shadow">
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> Logo updated successfully!
          </span>
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: crop, rotate &amp; background-removal need an image editor — for now,
        prepare a clean transparent PNG before uploading. Logos are stored in the
        database (no external storage needed).
      </p>
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function LogoImg({
  src,
  h,
  dark,
  fallbackText,
  big,
}: {
  src: string | null;
  h: number;
  dark?: boolean;
  fallbackText?: boolean;
  big?: boolean;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="logo" style={{ height: h }} className="w-auto object-contain" />;
  }
  if (!fallbackText) return null;
  return (
    <span
      className={`font-extrabold tracking-tight ${big ? "text-3xl" : "text-lg"} ${dark ? "text-white" : "text-foreground"}`}
      style={dark ? undefined : { color: undefined }}
    >
      China<span className="text-amber-400">Cart</span>
    </span>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 rounded-md border bg-background px-2 text-right font-mono text-xs"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border bg-background"
          aria-label={label}
        />
      </span>
    </label>
  );
}
