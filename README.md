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

## ✨ Premium 3D & motion

Apple-inspired 3D experience, built to stay smooth and lazy-loaded:

- **3D intro** — full-screen Three.js loading scene (rotating gold gem + red/gold
  particle field) that fades into the site. Shows once per session.
- **3D hero** — dark, premium hero with floating Three.js shapes, pointer
  parallax and a 3D-animated heading.
- **3D logo** — continuously rotating CSS 3D cube in the navbar.
- **Tilt + flip cards** — product cards flip in on scroll and tilt toward the
  pointer (`components/tilt-card.tsx`).
- **Scroll animations** — GSAP ScrollTrigger reveals (`components/reveal.tsx`)
  and an Apple-style **pinned** scroll section (`sections/pinned-showcase.tsx`).
- **Route visualization** — cinematic China→Bangladesh flight scene
  (`sections/route-visualization.tsx` + `three/route-scene.tsx`): starfield,
  3D waving flags, a GSAP-driven airplane on a curved arc with contrail and
  blinking lights, and an animated golden route line.

**Performance & a11y:** Three.js is dynamically imported (never blocks first
paint), capped device-pixel-ratio + particle counts, render loops pause when
offscreen or the tab is hidden, fewer objects on mobile, and everything honours
`prefers-reduced-motion` (intro skipped, animations disabled). The catalog/listing
pages stay on the light theme for readability; the intro, hero and pinned
showcase are dark.

## 🔐 Admin dashboard (`/admin`)

Password-protected order management:

- **Login** at `/admin/login` (password = `ADMIN_PASSWORD`, default `admin123` for dev).
  Sets an httpOnly HMAC session cookie; `/admin` redirects to login when unauthed.
- **Stats** — total revenue, total orders, average order value, units sold, pending & delivered counts.
- **Orders table** — every order with customer name, phone, email, address, payment method and full line items (expandable), searchable and filterable by status.
- **Status updates** — change any order between `pending / processing / shipped / delivered / cancelled` (saved via `PATCH /api/admin/orders`, admin-only).
- **Email on new orders** — `lib/email.ts` notifies the admin via [Resend](https://resend.com) when configured; otherwise it's skipped (checkout still works).

Set in `.env` / Vercel env vars: `ADMIN_PASSWORD`, and optionally `RESEND_API_KEY` + `ADMIN_EMAIL` + `EMAIL_FROM` for notifications.

## 🤖 CartBot — AI shopping assistant

Floating chat assistant (bottom-right, red/gold, "online" dot) that recommends
real products from the catalog.

- **Claude API** (`claude-sonnet-4-6`) via `app/api/chat` with a `search_products`
  **tool** that runs against `lib/catalog`, so CartBot recommends actual products
  (cards with image, price, Add-to-Cart, View) — never invented ones.
- Speaks **English + Bengali + Banglish** ("amar ekta chair lagbe"), quick-reply
  chips (Trending, Best Deals, Gift Ideas, Talk to Human…), typing indicator,
  session chat history, clear-chat, full-screen on mobile.
- **Graceful fallback**: with no `ANTHROPIC_API_KEY` (or if the API is
  unreachable) it falls back to keyword product search, so the bot always works.

Set `ANTHROPIC_API_KEY` in `.env` / Vercel env vars to enable the AI brain.

## 👓 AR Virtual Try-On (sunglasses)

Browser-based try-on — no app, works in Chrome/Safari/Firefox:

- **"Try On 👓"** button on every sunglasses product card, plus a **Virtual
  Try-On banner** on the sunglasses category view (`/products?category=sunglasses`).
- Full-screen modal: polite camera-permission prompt → live front-camera view →
  face detection via **face-api.js** (`@vladmandic/face-api`, 68 landmarks) →
  sunglasses locked to the eyes in real time, smoothed for jitter-free tracking.
- Switch styles, size/position sliders, **Take Photo**, **Share** (Web Share API /
  WhatsApp), **Save**, **Buy Now**, similar-style recommendations, "You look great!".
- Lazy-loaded: the face-api/TF.js bundle only downloads when the modal opens, so
  it never affects normal page load. Models load from a CDN by default
  (`NEXT_PUBLIC_FACEAPI_MODELS`); self-host in `public/models` for production.

> Glasses are drawn as crisp vector overlays (tinted lenses + frame) so they
> composite cleanly on the face. To use real background-removed product PNGs,
> add them as a style in `components/try-on/glasses-styles.ts`.

## 📱 AR Phone Case Try-On

"Try On Case 📱" on phone-case product cards + product page, and an **AR Try-On
badge** on the mobile-accessories category view.

- Full-screen modal with bilingual (English + Bengali) instructions → camera →
  **TensorFlow.js COCO-SSD** detects the phone (the "cell phone" object) → the
  case is overlaid and tracked to it in real time, smoothed for stability.
- Material-accurate procedural cases (silicone / glossy / clear / leather /
  rugged) with camera cutout, switchable **designs + colours**, **phone-model
  picker** (fit label + drop-protection rating), **front/back camera flip**,
  Take Photo (watermarked "ChinaCart") / Share / Save / Buy Now, recommendations.
- **360° mockup fallback** (phone model dropdown + front/back view) when the
  camera is denied or unsupported. Fun loading screen with a spinning case.
- TF.js loads only when the modal opens — listing pages stay light.

> Phone *model* can't be identified client-side (no such model exists), so the
> user picks their model for accurate sizing/labels; detection finds the phone
> region (COCO-SSD), not the brand. Cases are procedural overlays.

## 🛋️ AR Room Visualization (furniture)

"View In My Room 🛋️" on furniture product cards, the product page, and an
**AR Preview banner** on the furniture category view.

- Full-screen modal: polite camera prompt → **live back-camera** view → scanning
  animation ("Detecting floor…") → procedural **3D furniture** placed on the floor
  with a realistic soft shadow.
- **Drag** to move/place, **pinch** to resize, **two-finger twist** to rotate;
  desktop: **mouse drag**, **scroll** to resize, **arrow keys** to rotate. On-screen
  rotate buttons + size slider too.
- Colour variants, live **dimensions** readout, matching-furniture suggestions,
  **Take Photo** (watermarked "I found this on ChinaCart!"), **Share**, **Save**,
  **Buy Now**.
- **360° fallback** automatically when the camera is unavailable/denied (spinning
  3D model you can drag to rotate). Loading screen with progress + rotating tips.
- Three.js is lazy-loaded only when the modal opens — listing pages stay light.

> Furniture is built procedurally (recognisable low-poly models with real
> dimensions + tintable surfaces) since the catalog has no GLTF assets. Drop a
> `.glb` per type into `furniture-models.ts` to use real models. True WebXR
> plane-detection (Android Chrome only; unsupported on iOS Safari) can be layered
> on top of this camera-based experience later.

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

- **Prisma + PostgreSQL** (`prisma/schema.prisma`), connected via `DATABASE_URL`
- **Server cart** keyed by an httpOnly `cartId` cookie — survives reloads and devices on the same browser. Models: `Cart`, `CartItem`.
- **Orders** persisted on checkout with denormalized line-item snapshots. Models: `Order`, `OrderItem`.
- **API routes** (`app/api/*`):
  - `GET/POST/PATCH/DELETE /api/cart` — read / add / set quantity / remove (or clear)
  - `POST /api/orders` — create an order from the current cart (totals computed server-side, cart cleared)
- **Pages**: `/checkout` (shipping + payment form) → `/orders/[id]` (confirmation).

The cart/order APIs validate product IDs and prices server-side against the
catalog (`lib/catalog.ts`), so the client never sets prices.

```bash
# Local dev / production need a Postgres DATABASE_URL (see .env.example)
cp .env.example .env       # then paste your Neon connection string
npm run db:push            # sync schema → Postgres
```

> On **Vercel**, set `DATABASE_URL` to a serverless Postgres (e.g. [Neon](https://neon.tech)).
> The `vercel-build` script runs `prisma db push` automatically before `next build`,
> so tables are created on first deploy.

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Three.js · GSAP ScrollTrigger · Framer Motion · Prisma · PostgreSQL (Neon) · Lucide React · next/image

## 🚀 Getting Started

```bash
npm install
cp .env.example .env   # add your Postgres DATABASE_URL
npm run db:push        # create tables
npm run dev            # http://localhost:3000
npm run build          # production build
npm run lint           # eslint
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
