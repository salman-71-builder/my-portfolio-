"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, Link2, ImagePlus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [imageOpen, setImageOpen] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category !== "all") params.set("category", category);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <>
      <form
        onSubmit={submit}
        className={cn(
          "flex w-full items-stretch overflow-hidden rounded-full border-2 border-brand-gold bg-white shadow-sm",
          className
        )}
      >
        <select
          aria-label="Search category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="hidden shrink-0 border-r bg-muted/50 px-3 text-sm font-medium outline-none sm:block"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 10,000+ products, or paste an image URL…"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
        />
        <button
          type="button"
          aria-label="Search by image"
          onClick={() => setImageOpen(true)}
          className="flex shrink-0 items-center px-3 text-muted-foreground transition-colors hover:text-primary"
          title="Search by image (URL, photo or file)"
        >
          <Camera className="h-5 w-5" />
        </button>
        <button
          type="submit"
          aria-label="Search"
          className="flex shrink-0 items-center gap-1 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      <ImageSearchDialog open={imageOpen} onOpenChange={setImageOpen} />
    </>
  );
}

function ImageSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function runVisualSearch(source: string) {
    // Smart visual search → routes to products with an image flag.
    const params = new URLSearchParams({ visual: "1" });
    if (source.startsWith("http")) params.set("imageUrl", source);
    onOpenChange(false);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Smart Visual Search
          </DialogTitle>
          <DialogDescription>
            Find matching wholesale products by image — paste a URL, take a
            photo, or upload a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url" className="gap-1">
              <Link2 className="h-4 w-4" /> URL
            </TabsTrigger>
            <TabsTrigger value="photo" className="gap-1">
              <ImagePlus className="h-4 w-4" /> Photo
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-1">
              <Upload className="h-4 w-4" /> File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-3 pt-2">
            <Input
              type="url"
              placeholder="https://example.com/product.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!url.startsWith("http")}
              onClick={() => runVisualSearch(url)}
            >
              <Search className="h-4 w-4" /> Search this image
            </Button>
          </TabsContent>

          <TabsContent value="photo" className="space-y-3 pt-2">
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-4 w-4" /> Take a photo
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-3 pt-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">
                Click to upload an image
              </span>
              <span className="text-xs">PNG, JPG up to 10MB</span>
            </button>
          </TabsContent>
        </Tabs>

        {preview && (
          <div className="space-y-3">
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Search preview"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setPreview(null)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button className="w-full" onClick={() => runVisualSearch("upload")}>
              <Search className="h-4 w-4" /> Find similar products
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
