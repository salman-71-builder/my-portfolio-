"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  FileText,
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageGallery } from "@/components/image-gallery";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/components/cart-provider";
import { formatBDT, formatPriceRange } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { Supplier } from "@/data/suppliers";

export function ProductDetail({
  product,
  supplier,
}: {
  product: Product;
  supplier?: Supplier;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(product.moq);
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [quoteSent, setQuoteSent] = React.useState(false);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isHot && <Badge variant="hot">Hot Seller</Badge>}
            {product.isNew && <Badge variant="gold">New Arrival</Badge>}
            {product.discount > 0 && (
              <Badge>{product.discount}% OFF</Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating
              rating={product.rating}
              reviews={product.reviews}
              size="md"
            />
          </div>

          <div className="mt-5 rounded-xl bg-accent/60 p-4">
            <p className="text-3xl font-extrabold text-brand">
              {formatPriceRange(product.priceMin, product.priceMax)}
            </p>
            <p className="text-sm text-muted-foreground">per piece</p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Badge variant="outline" className="gap-1 px-3 py-1 text-sm">
              <Package className="h-4 w-4" />
              Minimum Order: {product.moq} pcs
            </Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" /> {product.shippingDays}
            </span>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <Label className="mb-2 block">Quantity (pcs)</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQty((q) => Math.max(product.moq, q - 10))}
                  className="p-3 text-muted-foreground hover:text-brand"
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={product.moq}
                  onChange={(e) =>
                    setQty(Math.max(product.moq, Number(e.target.value) || product.moq))
                  }
                  className="w-20 border-x bg-transparent py-2 text-center font-semibold focus:outline-none"
                />
                <button
                  onClick={() => setQty((q) => q + 10)}
                  className="p-3 text-muted-foreground hover:text-brand"
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Est. subtotal: </span>
                <span className="font-bold text-brand">
                  {formatBDT(qty * product.priceMin)}
                </span>
              </div>
            </div>
            {qty < product.moq && (
              <p className="mt-1 text-xs text-destructive">
                Minimum order is {product.moq} pcs.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => addItem(product, qty)}
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => setQuoteOpen(true)}
            >
              <FileText className="h-5 w-5" /> Request Quote
            </Button>
          </div>

          {/* Supplier card */}
          {supplier && (
            <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Image
                  src={supplier.logo}
                  alt={supplier.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold">{supplier.name}</p>
                    {supplier.verified && (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {supplier.location}
                  </p>
                </div>
                <StarRating
                  rating={supplier.rating}
                  reviews={supplier.reviews}
                />
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-bold text-brand">{supplier.yearsActive} yrs</p>
                  <p className="text-muted-foreground">On platform</p>
                </div>
                <div>
                  <p className="font-bold text-brand">{supplier.responseRate}</p>
                  <p className="text-muted-foreground">Response rate</p>
                </div>
                <div>
                  <p className="font-bold text-brand">
                    {supplier.reviews.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="flex-wrap">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="prose max-w-none text-sm leading-relaxed text-foreground">
              <p>{product.description}</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Factory-direct wholesale pricing in BDT",
                  "OEM / ODM and custom branding supported",
                  "Quality inspection before shipment",
                  "Consolidated shipping to Bangladesh",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> {point}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr
                      key={s.label}
                      className={i % 2 === 0 ? "bg-muted/40" : ""}
                    >
                      <td className="w-1/3 px-4 py-3 font-semibold">
                        {s.label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 font-semibold">MOQ</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.moq} pcs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="shipping">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand" /> Estimated delivery:{" "}
                <span className="font-semibold text-foreground">
                  {product.shippingDays}
                </span>{" "}
                to Bangladesh.
              </p>
              <p>
                Orders are consolidated at our Guangzhou warehouse, shipped via
                air or sea freight, cleared through customs and delivered to your
                doorstep. Free shipping on orders over ৳50,000.
              </p>
              <p>
                Tracking is provided at every stage — from China dispatch to
                Chittagong port and final delivery in Bangladesh.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-brand">
                    {product.rating.toFixed(1)}
                  </p>
                  <StarRating
                    rating={product.rating}
                    showCount={false}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.reviews.toLocaleString()} reviews
                  </p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <p className="text-sm text-muted-foreground">
                  Verified buyers rate this product highly for quality and value.
                  Bulk buyers report consistent quality across reorders.
                </p>
              </div>
              {[
                {
                  name: "Imran H.",
                  text: "Great quality for the price. Reordered twice — consistent every time.",
                },
                {
                  name: "Nadia R.",
                  text: "Fast delivery to Dhaka and the samples matched the bulk order perfectly.",
                },
              ].map((r) => (
                <div key={r.name} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <StarRating rating={5} showCount={false} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Quote dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        {quoteSent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h3 className="text-xl font-bold">Quote Requested!</h3>
            <p className="text-sm text-muted-foreground">
              Our sourcing team will email you a custom quote within 24 hours.
            </p>
            <Button onClick={() => setQuoteOpen(false)}>Close</Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuoteSent(true);
            }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-xl font-bold">Request a Quote</h3>
              <p className="text-sm text-muted-foreground">
                For {product.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qname">Name</Label>
                <Input id="qname" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="qphone">Phone</Label>
                <Input id="qphone" required className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="qemail">Email</Label>
              <Input id="qemail" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="qqty">Quantity needed (pcs)</Label>
              <Input
                id="qqty"
                type="number"
                defaultValue={qty}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
