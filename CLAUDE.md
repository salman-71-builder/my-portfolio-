# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository hosts **Import China** — a B2B wholesale sourcing e-commerce website (Bangladesh, importchina.com.bd) built with Next.js 14 (App Router), TypeScript, Tailwind CSS and shadcn/ui-style components.

## Repository

- **GitHub**: `salman-71-builder/my-portfolio-`
- **Purpose**: B2B wholesale sourcing platform ("Import China")

## Commands

- `npm install` — install dependencies (runs `prisma generate` via postinstall)
- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — `prisma generate && next build` (no DB connection needed at build)
- `npm run vercel-build` — Vercel build hook: also runs `prisma db push` to sync the schema to Postgres
- `npm run lint` — ESLint (`next lint`)
- `npm run db:push` — sync the Prisma schema to the database (needs `DATABASE_URL`)

## Deployment (Vercel)

- Import the repo at vercel.com; framework auto-detects Next.js.
- Set a **`DATABASE_URL`** env var to a serverless Postgres connection string (e.g. [Neon](https://neon.tech)).
- Vercel runs `vercel-build`, which `prisma db push`es the schema to Postgres before `next build`.
- DummyJSON works with no extra config — Vercel's runtime has no egress allowlist.

## Architecture

- `app/` — App Router pages: `/`, `/products`, `/products/[id]`, `/categories`, `/how-it-works`, `/about`, `/contact`, `/auth`, `/suppliers`. Root layout wires the cart provider, navbar, footer, cart drawer and mobile bottom nav.
- `components/ui/` — dependency-light shadcn-style primitives (Button, Card, Badge, Input, Label, Separator, Tabs, Slider, Sheet, Dialog).
- `components/sections/` — home page sections (hero, stats, category grid, featured/flash/new products, how-it-works, why-choose-us, suppliers showcase, testimonials, newsletter).
- `components/` — shared pieces: navbar, footer, search-bar (text + image search), product-card, cart-provider/cart-drawer (localStorage), product-detail, image-gallery, filter-sidebar, products-browser, etc.
- `components/three/` — lazy, client-only Three.js scenes: `intro-overlay` (3D loading intro), `floating-shapes` (hero background), and `route-scene` (China→Bangladesh flight visualization: starfield, CPU-waved flags, GSAP-driven plane on a curved arc with contrail + blinking lights, dashed gold route line, projected DOM country labels). Wrapped by `sections/route-visualization` and placed on the homepage between hero and products. Imported via `next/dynamic` with `ssr:false`; render loops pause offscreen/hidden and respect reduced-motion.
- Logo: `chinacart-logo` (CSS 3D "CHINA"#1a2f5e + cart + "CART"#c0392b wordmark on a black plate; `variant="nav"|"hero"`) used in navbar/footer; `hero-logo` adds scroll-driven scale/fade for the large homepage version. (`logo-3d` cube is retained but unused.)
- 3D/motion helpers: `site-intro` (once-per-session intro gate), `tilt-card` (flip-in + pointer tilt), `reveal` + `sections/pinned-showcase` (GSAP ScrollTrigger reveals & Apple-style pinned scroll).
- `data/` — sample/fallback data: `products.ts` (30 products), `categories.ts` (12), `suppliers.ts`, `testimonials.ts`. Used as the offline fallback when the product API is unreachable.
- `lib/utils.ts` — `cn()` and BDT currency formatting.

## Product data source (`lib/catalog.ts`)

- **Single abstraction layer** for all product/category data. Currently backed by the free, no-key **DummyJSON API** (`https://dummyjson.com`), mapped into our `Product`/`Category` shapes (prices converted USD→BDT). To switch to **CJ Dropshipping** later, only this file changes — swap `BASE_URL`, the fetch paths and `mapProduct`/`mapCategory`.
- Falls back to bundled sample data in `data/*.ts` if the API is unreachable (e.g. host not allow-listed for egress), so the site never breaks.
- Async functions: `getAllProducts`, `getProductById`, `getProductsByCategory`, `getRelatedProducts`, `searchProducts`, `getFeaturedProducts`, `getNewProducts`, `getFlashDeals`, `getCategories`, `getCategoryBySlug`.
- API routes: `app/api/products` (`?q=`, `?category=`) and `app/api/categories` feed client components (products browser, navbar/footer search). Pages that render catalog data are `force-dynamic` so fetching happens at request time.
- **Egress**: the deployment must allow-list `dummyjson.com` (and later the CJ API host) in its network egress settings for live data; otherwise the sample fallback is served.

## Backend (cart & orders)

- **Prisma + PostgreSQL** — schema in `prisma/schema.prisma` (`Cart`, `CartItem`, `Order`, `OrderItem`); connection via `DATABASE_URL` (Neon in production). Local dev needs a Postgres `DATABASE_URL` (see `.env.example`).
- `lib/prisma.ts` — singleton client. `lib/cart-server.ts` — cookie-based cart session (`cartId` httpOnly cookie) + serialization enriched from the product catalog.
- API route handlers: `app/api/cart/route.ts` (GET/POST/PATCH/DELETE) and `app/api/orders/route.ts` (POST). Both `force-dynamic`.
- `components/cart-provider.tsx` is server-backed (optimistic updates + `/api/cart` sync); catalog still lives in `data/*.ts`.
- Pages: `app/checkout/page.tsx` → `app/orders/[id]/page.tsx` (server component reading via Prisma).
- Prices/totals are always recomputed server-side from `data/products.ts`; the client never sets prices.

## AR Virtual Try-On (sunglasses)

- `components/try-on/`: `try-on-button` (lazy entry, opens the modal), `try-on-modal` (camera + `@vladmandic/face-api` 68-landmark detection, decoupled detect/render loops with smoothing, canvas overlay, capture/share/buy/recommendations), `glasses-styles` (vector sunglasses drawn on canvas).
- "Try On 👓" button shows on sunglasses `ProductCard`s; a banner shows in `products-browser` when `category=sunglasses`.
- face-api/TF.js is dynamically imported only when the modal opens; models load from `NEXT_PUBLIC_FACEAPI_MODELS` (CDN default, or self-host in `public/models`). `next.config.mjs` sets `fs/encoding/path` webpack fallbacks for the browser build.

## CartBot AI assistant

- `components/chatbot/chat-widget.tsx` (client, mounted in root layout): floating chat, quick replies, product cards (Add-to-Cart/View), typing indicator, sessionStorage history, clear-chat, mobile full-screen.
- `app/api/chat/route.ts` (`force-dynamic`): Anthropic SDK, model `claude-sonnet-4-6`, with a `search_products` tool executed server-side against `lib/catalog` (manual tool loop, ≤3 iterations). Returns `{reply, products}`.
- Bilingual (EN/BN/Banglish) via the system prompt. **Keyword fallback** (`keywordFallback`) runs when `ANTHROPIC_API_KEY` is unset or the API errors, so the bot always responds with real catalog products.

## AR Phone Case Try-On

- `components/try-case/`: `phone-case-types` (pure: models, designs, colours, `isPhoneCaseProduct`; no TF import), `case-render` (canvas 2D case drawing per material), `try-case-modal` (camera + TF.js COCO-SSD `cell phone` detection, decoupled detect/render loops + smoothing, overlay tracked to the bbox, scanning/loading UI, design/colour/model switchers, camera flip, capture/share/buy, 360 mockup fallback, EN+BN instructions), `try-case-button` (lazy entry).
- "Try On Case 📱" on phone-case `ProductCard`s + `ProductDetail`; "AR Case Try-On" banner in `products-browser` when `category=mobile-accessories`.
- TF.js + COCO-SSD dynamically imported only when the modal opens. No phone-model identification (not possible client-side) — user selects the model; detection locates the phone region only.

## AR Room Visualization (furniture)

- `components/ar-room/`: `furniture-types` (pure metadata + `detectFurnitureType`/`isFurnitureProduct`, **no Three import** so listings stay light), `furniture-models` (Three.js procedural builders + `tintFurniture`), `ar-room-modal` (camera-overlay AR + 360 fallback, scanning/loading UI, pointer drag/pinch/twist + wheel/arrow controls, shadow-catcher, capture/share/buy, colour variants, dimensions, recommendations), `ar-room-button` (lazy entry).
- "View In My Room 🛋️" shows on furniture `ProductCard`s and `ProductDetail`; an "AR Preview" banner shows in `products-browser` when `category=furniture`.
- Three.js is dynamically imported only when the modal opens. No raw WebXR session (iOS Safari can't do immersive-ar) — uses a broadly-supported camera overlay with a 360° fallback.

## Admin dashboard (`/admin`)

- Password-gated via `lib/admin-auth.ts` (env `ADMIN_PASSWORD`, dev default `admin123`): login sets an httpOnly HMAC cookie; `app/admin/page.tsx` redirects to `/admin/login` when unauthed.
- `app/admin/page.tsx` (server, `force-dynamic`) shows sales/revenue stats + `components/admin/orders-table.tsx` (client: search, status filter, expandable details, inline status updater). DB errors degrade to a friendly notice.
- API: `app/api/admin/login`, `app/api/admin/logout`, `app/api/admin/orders` (PATCH status, admin-only). Statuses in `lib/order-status.ts`.
- New-order email via `lib/email.ts` (Resend HTTP API if `RESEND_API_KEY`+`ADMIN_EMAIL` set; safe no-op otherwise), called from `app/api/orders`.

## Conventions

- Brand colors via Tailwind: `brand` (#CC0000) and `gold` (#FFD700); CSS variables in `app/globals.css`.
- `@/*` path alias maps to repo root (see `tsconfig.json`).
- Remote image hosts are allow-listed in `next.config.mjs`.
