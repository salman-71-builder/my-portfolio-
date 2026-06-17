# Import China 🇨🇳🇧🇩

**Bangladesh's #1 B2B Wholesale Sourcing Platform** — source products directly from verified suppliers in China and save up to 60%.

A modern, fully responsive B2B wholesale e-commerce website inspired by chinacart.com.bd, built with Next.js 14 (App Router), TypeScript, Tailwind CSS and shadcn/ui-style components.

## ✨ Features

- **Home page** — hero, stats bar, 12-category grid, featured products, flash deals with countdown, how-it-works, why-choose-us, new arrivals, supplier showcase, testimonial slider, newsletter
- **Products page** (`/products`) — sidebar filters (category, price range slider, MOQ, rating, shipping time), sorting, removable filter tags, pagination
- **Smart search** — text search, category-scoped search, URL-driven search (`?q=&category=`), and **search by image** (picture URL / take a photo / upload a file)
- **Product detail** (`/products/[id]`) — image gallery with hover zoom, quantity selector, add-to-cart, request-quote dialog, supplier card, tabbed info (Description / Specs / Shipping / Reviews), related products
- **Categories, How It Works (with FAQ + shipping timeline), About, Contact, Suppliers, Auth (login/register as buyer or supplier)**
- **Cart** — localStorage-persisted, slide-out drawer, quantity updates, BDT totals, free-shipping progress
- **Mobile-first** — hamburger drawer + bottom navigation bar
- Smooth Framer Motion animations throughout

## 🎨 Branding

- Primary: `#CC0000` (red) · Accent: `#FFD700` (gold) · Background: `#FFFFFF`
- Inter font, bold headings, Chinese-inspired pattern motifs

## 🛰️ Product data (DummyJSON → CJ Dropshipping)

Products and categories are served through a single abstraction layer in
**`lib/catalog.ts`**, currently backed by the free, no-API-key
[DummyJSON](https://dummyjson.com) API:

- Real-looking products with images, prices (converted USD→BDT), ratings and specs
- Working **search** (`/products?q=…`), **categories** and **product detail** pages
- `app/api/products` and `app/api/categories` expose the mapped data to the client
- Graceful **fallback** to bundled sample data (`data/*.ts`) if the API is unreachable

**Swapping to CJ Dropshipping later:** change only `lib/catalog.ts` — the
`BASE_URL`, fetch paths and the `mapProduct` / `mapCategory` functions. The rest
of the app consumes the same `Product` / `Category` shapes and needs no changes.

> ⚠️ **Egress allow-list:** for live data, the host (`dummyjson.com`, and later
> your CJ API host) must be allowed in your deployment's network egress
> settings. If it's blocked, the site automatically serves the sample fallback.

## 🔌 Backend (cart & orders)

A real persistence layer backs the cart and checkout:

- **Prisma + SQLite** (`prisma/schema.prisma`, file DB at `prisma/dev.db`)
- **Server cart** keyed by an httpOnly `cartId` cookie — survives reloads and devices on the same browser. Models: `Cart`, `CartItem`.
- **Orders** persisted on checkout with denormalized line-item snapshots. Models: `Order`, `OrderItem`.
- **API routes** (`app/api/*`):
  - `GET/POST/PATCH/DELETE /api/cart` — read / add / set quantity / remove (or clear)
  - `POST /api/orders` — create an order from the current cart (totals computed server-side, cart cleared)
- **Pages**: `/checkout` (shipping + payment form) → `/orders/[id]` (confirmation).

The product catalog stays in `data/*.ts`; the cart/order APIs validate product IDs and prices against it server-side, so all the static product pages keep prerendering.

```bash
npm run db:push   # sync schema → SQLite (also run automatically in `npm run build`)
```

> SQLite is self-contained but file-based — data resets if the deployment's filesystem is ephemeral. Swap the datasource to Postgres in `prisma/schema.prisma` for durable hosting.

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Prisma · SQLite · Framer Motion · Lucide React · next/image

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## 📁 Structure

```
app/                 # App Router pages
  page.tsx           # Home
  products/          # Listing + [id] detail
  categories/ how-it-works/ about/ contact/ auth/ suppliers/
components/
  ui/                # Button, Card, Badge, Input, Tabs, Slider, Sheet, Dialog…
  sections/          # Home page sections
  navbar, footer, search-bar, product-card, cart-*, etc.
data/                # products, categories, suppliers, testimonials (dummy data)
lib/                 # utils (cn, BDT formatting)
```

> Product images use placeholder services (picsum.photos). Auth, checkout and quote forms are front-end demos.
