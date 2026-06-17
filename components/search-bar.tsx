"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, ImageIcon, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";
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
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [imageMenuOpen, setImageMenuOpen] = React.useState(false);
  const [imageHint, setImageHint] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
        "flex w-full items-stretch rounded-full border-2 border-brand bg-white shadow-sm",
        className
      )}
    >
      {/* Category scope */}
      <div className="hidden items-center border-r border-brand/20 sm:flex">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-full cursor-pointer rounded-l-full bg-transparent px-4 text-sm font-medium text-foreground focus:outline-none"
          aria-label="Search category"
        >
          <option value="all">All Categories</option>
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
          placeholder="Search 10,000+ wholesale products from China…"
          className="h-11 w-full bg-transparent px-4 text-sm focus:outline-none"
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
          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border bg-white py-1 shadow-xl">
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
      <Button
        type="submit"
        className="m-1 rounded-full px-5"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search</span>
      </Button>
    </form>
  );
}
