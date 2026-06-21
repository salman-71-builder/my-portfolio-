"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, ImageIcon, Paperclip, X, Mic } from "lucide-react";
import { useCategories } from "@/components/use-categories";
import { useLang } from "@/components/language-provider";
import { cn } from "@/lib/utils";

/**
 * Smart search:
 * - text query (navigates to /products?q=...)
 * - category scope dropdown
 * - image search: paste an image URL, upload a photo, or attach a file.
 *   Filename / URL keywords are used to drive the text search.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const categories = useCategories();
  const { t } = useLang();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [imageMenuOpen, setImageMenuOpen] = React.useState(false);
  const [imageHint, setImageHint] = React.useState<string | null>(null);
  const [listening, setListening] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  function startVoice() {
    type RecResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
    type Rec = {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((e: RecResult) => void) | null;
      start: () => void;
    };
    const w = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Voice search isn't supported in this browser. Try Chrome 🙂");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.onresult = (e: RecResult) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setQuery(transcript);
        runSearch(transcript);
      }
    };
    rec.start();
  }

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setImageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function runSearch(q: string, scope = category) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (scope && scope !== "all") params.set("category", scope);
    router.push(`/products?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function deriveKeywords(raw: string): string {
    // strip path, extension and separators to build a search query
    const base = raw.split(/[\\/]/).pop() ?? raw;
    return base
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_+.]/g, " ")
      .replace(/\d+/g, " ")
      .trim();
  }

  function handleFile(file: File) {
    const kw = deriveKeywords(file.name);
    setImageHint(file.name);
    setImageMenuOpen(false);
    runSearch(kw || query);
  }

  function handleImageUrl() {
    const url = window.prompt("Paste an image URL to search by picture:");
    if (!url) return;
    const kw = deriveKeywords(url);
    setImageHint(url);
    setImageMenuOpen(false);
    runSearch(kw || query);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-md bg-white text-foreground shadow-sm ring-amber-400 transition-shadow focus-within:ring-2",
        className
      )}
    >
      {/* Category scope */}
      <div className="hidden items-center border-r bg-secondary sm:flex">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-full cursor-pointer bg-transparent px-3 text-xs font-medium text-foreground focus:outline-none"
          aria-label="Search category"
        >
          <option value="all">{t("all")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Text input */}
      <div className="relative flex flex-1 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
          className="h-10 w-full bg-transparent px-3 text-sm text-foreground focus:outline-none"
          aria-label="Search products"
        />
        {imageHint && (
          <button
            type="button"
            onClick={() => setImageHint(null)}
            className="mr-1 flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground"
          >
            <ImageIcon className="h-3 w-3" />
            <span className="max-w-[90px] truncate">{imageHint}</span>
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Voice search */}
      <button
        type="button"
        onClick={startVoice}
        className={cn(
          "flex h-11 items-center px-2 transition-colors",
          listening ? "animate-pulse text-brand" : "text-brand hover:text-brand-800"
        )}
        aria-label="Search by voice"
        title="Search by voice"
      >
        <Mic className="h-5 w-5" />
      </button>

      {/* Image / photo / file search */}
      <div className="relative flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setImageMenuOpen((o) => !o)}
          className="flex h-11 items-center px-2 text-brand transition-colors hover:text-brand-800"
          aria-label="Search by image"
          title="Search by image"
        >
          <Camera className="h-5 w-5" />
        </button>

        {imageMenuOpen && (
          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border bg-popover py-1 text-popover-foreground shadow-xl">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Search by image
            </p>
            <button
              type="button"
              onClick={handleImageUrl}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <ImageIcon className="h-4 w-4 text-brand" /> Picture (URL)
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.setAttribute("capture", "environment");
                fileInputRef.current?.click();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <Camera className="h-4 w-4 text-brand" /> Take a photo
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.removeAttribute("capture");
                fileInputRef.current?.click();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <Paperclip className="h-4 w-4 text-brand" /> Upload a file
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex items-center gap-1.5 bg-amber-400 px-4 text-sm font-semibold text-navy transition-colors hover:bg-amber-500"
        aria-label={t("search")}
      >
        <Search className="h-5 w-5" />
        <span className="hidden md:inline">{t("search")}</span>
      </button>
    </form>
  );
}
