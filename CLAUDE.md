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
- `components/three/` — lazy, client-only Three.js scenes: `intro-overlay` (3D loading intro) and `floating-shapes` (hero background). Imported via `next/dynamic` with `ssr:false`; render loops pause offscreen/hidden and respect reduced-motion.
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

## Admin dashboard (`/admin`)

- Password-gated via `lib/admin-auth.ts` (env `ADMIN_PASSWORD`, dev default `admin123`): login sets an httpOnly HMAC cookie; `app/admin/page.tsx` redirects to `/admin/login` when unauthed.
- `app/admin/page.tsx` (server, `force-dynamic`) shows sales/revenue stats + `components/admin/orders-table.tsx` (client: search, status filter, expandable details, inline status updater). DB errors degrade to a friendly notice.
- API: `app/api/admin/login`, `app/api/admin/logout`, `app/api/admin/orders` (PATCH status, admin-only). Statuses in `lib/order-status.ts`.
- New-order email via `lib/email.ts` (Resend HTTP API if `RESEND_API_KEY`+`ADMIN_EMAIL` set; safe no-op otherwise), called from `app/api/orders`.

## Conventions

- Brand colors via Tailwind: `brand` (#CC0000) and `gold` (#FFD700); CSS variables in `app/globals.css`.
- `@/*` path alias maps to repo root (see `tsconfig.json`).
- Remote image hosts are allow-listed in `next.config.mjs`.
