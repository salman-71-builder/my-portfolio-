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
- `npm run seed` — seed demo orders + expenses for the finance dashboard (needs `DATABASE_URL`; wipes & reseeds finance data)

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
- Engagement layer: `social-proof` (mounted in root layout — rotating "just ordered" toasts bottom-left + live-viewer counter, clean light cards, pure client-side simulation, no PII/network) and `count-up` (IntersectionObserver count-up, used by the stats bar).
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

## 3D Virtual Showroom (`/showroom`)

- `components/showroom/showroom-scene.tsx` (heavy, lazy `ssr:false`): raw three.js first-person room — floor/walls/ceiling, lights, product image displays (raycast click → `onSelect`), simulated avatars, synthesized WebAudio ambient pad (attached as `__audio` on the mount), WebXR immersive-vr entry. Controls: pointer-lock + WASD (desktop), drag-look + on-screen D-pad (touch).
- `components/showroom/showroom-experience.tsx`: room selector (Electronics/Furniture/Fashion/Gadgets) + **walkable doorways** between rooms (left wall = prev, right wall = next; stepping through swaps the room and spawns you at the matching doorway, with a fade), per-room product fetch from `/api/products`, product detail panel (Add to Cart / View), simulated "N people now" badge, music toggle. Full-screen `z-[60]` over the navbar. Linked from navbar + a homepage CTA.

## Engagement features

- `wishlist-provider` (localStorage, collections) + heart on `ProductCard`; `app/wishlist` → `wishlist-view` (own list grouped by collection + shared `?ids=` view that fetches `/api/products`). Navbar/mobile-menu entry with count.
- Voice search: Web Speech API mic in `search-bar`.
- `sections/mood-shopping` on the homepage. `bulk-calculator` on `app/products/[id]` (tiered pricing, duty/shipping/landed cost, profit, WhatsApp/print).
- `spin-wheel` (`SpinWheelButton` in navbar/menu) + `flash-mob` (layout-mounted) use `lib/confetti` (dependency-free, reduced-motion aware).
- `app/manifest.ts` — PWA manifest.

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

## Order management (`/admin/orders`)

- Admin-only. `app/admin/orders/page.tsx` (server) loads orders+items → `components/admin/orders-manager.tsx` (client): stat cards (today/pending/to-ship/delivered/cancelled/revenue), status filter chips with counts, search (id/name/phone/product), collapsible date-range + amount-range filters, pagination, per-row quick status select, bulk-select → print labels, CSV export, refresh.
- Statuses live in `lib/order-status.ts` — 9-stage lifecycle (pending→confirmed→processing→packed→shipped→out_for_delivery→delivered, plus cancelled/returned) with label/emoji/badge meta. Old 5 values stay valid. `isRevenueStatus()` excludes cancelled+returned (finance + dashboard use it).
- Order detail `app/admin/orders/[id]` → `components/admin/order-detail-admin.tsx`: full products + price breakdown, customer/contact, status updater (records an `OrderEvent`), timeline+notes, mark paid/unpaid, cancel, refund/return, duplicate, links to invoice & label, per-customer Call/WhatsApp/Email deep links.
- **Invoice** `app/admin/orders/[id]/invoice` (`invoice-view.tsx`): print-to-PDF invoice with logo, itemized totals, Paid/Unpaid stamp. **Shipping labels** `app/admin/orders/labels?ids=a,b,c` (`label-sheet.tsx`): printable labels with a real Code128 barcode (`lib/barcode.ts`, no deps), COD amount, bulk print.
- New-order **notifications**: `components/admin/order-bell.tsx` (in the admin header) polls `/api/admin/orders` (GET stats) every 30s, shows a red count badge for orders newer than last-seen (localStorage) and plays a WebAudio chime. Admin email on new order already fires from `app/api/orders` via `lib/email.ts`.
- APIs (admin-only): `/api/admin/orders` PATCH (status→event, or paid) + GET (poll stats); `/api/admin/order-events` POST (note); `/api/admin/orders/duplicate` POST. DB models `OrderEvent` + `Order.paid` (`prisma/schema.prisma`).

## Customer management (`/admin/customers`)

- Customers are **derived from orders** (no separate table) — `lib/customers.ts` (pure): `aggregateCustomers()` groups orders by email → name/phone/spend/orders/AOV/join+last dates/active; VIP tiers (gold/silver/bronze medals by spend rank); `customerInsights()` + `growthSeries()`; BD contact helpers (`intlPhone`, `waLink`, `telLink`, `smsLink`, `mailtoLink`); message templates + `fillTemplate`; stable url-safe customer id via `encodeCustomerId`/`decodeCustomerId` (base64 of email).
- `components/admin/customers-manager.tsx`: insight cards (total/new-this-month/returning/dormant), CSS growth bar chart, top-districts + biggest-spender, All/VIP tabs (top 10/50/100), search, sort (spend/orders/recent/joined/name), pagination, avatars, VIP medals, CSV export, bulk message (template → mailto BCC / copy emails).
- Profile `app/admin/customers/[id]` → `components/admin/customer-profile.tsx`: info + stats (orders/spent/AOV/member-since), active/VIP badges, full order history (links to order detail), Call/SMS/WhatsApp/Email with pre-filled template message.
- Comms note: per-customer Call/SMS/WhatsApp/Email use device deep links (`tel:`/`sms:`/`wa.me`/`mailto:`); automated SMS/WhatsApp blasts + scheduled sends need an external gateway and are intentionally not wired.

## Finance dashboard (`/admin/finance`)

- Admin-only (same `isAdmin()` gate). `app/admin/finance/page.tsx` (server, `force-dynamic`) loads orders + `Expense` + `ProductCost` rows, attaches each order item's category from the bundled catalog, and renders `components/admin/finance-dashboard.tsx` (client). DB errors degrade to a friendly notice.
- `lib/finance.ts` — **pure shared money math** (no db/server imports): `formatTaka` (BDT lakh grouping ৳1,50,000) + `formatTakaCompact`, expense categories/colours, `DEFAULT_COST_RATIO` (cost = real `ProductCost` override else a fixed fraction of selling price), `summarize()` (revenue/COGS/expenses → grouped P&L, net profit, margin over a `[start,end)` window), `namedRange()`, `orderFinance()`, `pctChange()`.
- Money model: Revenue = non-cancelled order totals; COGS = per-item cost×qty (auto); Net Profit = Revenue − COGS − operating expenses. P&L groups into Revenue / Cost of Products (COGS + `product_cost` expenses) / Shipping (shipping+customs) / Other.
- Dashboard features: period filters (today/week/month/last month/year/all + custom range) with vs-previous-period arrows; overview cards; 12-month revenue+profit line, profit bar, expense pie, daily-sales, best-sellers & category bars (Recharts, lazy `ssr:false`); monthly P&L with side-by-side month compare; most/least-profitable products; key metrics (customers, repeat %, orders, pending/completed, refunds); per-order financial table (selling/cost/profit/margin + profit filter); smart insights; CSV export + **Month-End Report** via `window.print()` (print CSS hides chrome — see `.no-print`/`.print-only` in `globals.css`).
- Expense CRUD: `components/admin/expense-manager.tsx` → `app/api/admin/expenses` (GET/POST/PATCH/DELETE). Per-product cost overrides: `app/api/admin/product-costs` (GET/POST/DELETE). Both admin-only.
- **Cost prices** (`/admin/products`): `app/admin/products/page.tsx` (server, admin-gated) lists the live catalog via `getAllProducts()` + saved `ProductCost` rows; `components/admin/product-costs-manager.tsx` (client) is a searchable table to set each product's cost price (inline edit → autosave on blur/Enter, live profit/margin, Exact/Estimated badge, reset-to-estimate). Setting a cost makes per-sale profit exact everywhere (orders financial view + dashboard); unset products fall back to the `DEFAULT_COST_RATIO` estimate.
- DB models `Expense` and `ProductCost` (`prisma/schema.prisma`). Seed demo orders+expenses with `npm run seed` (`scripts/seed-finance.mjs`, needs `DATABASE_URL`; wipes & reseeds finance data — never run on production data).

## Conventions

- **Light, minimal theme** (Apple/Scandinavian): the design tokens in `app/globals.css` `:root` are a clean light palette — `--background` white, `--foreground` #1a1a1a, `--muted-foreground` #666, `--secondary`/`--muted`/`--accent` light gray #f5f5f8, `--primary` orange-red #c0392b, `--border` #e5e5e5. Tailwind `brand` = #c0392b and `navy` = #1a2f5e (logo colors); `gold` is retained only for the immersive AR/3D overlays. Components use semantic tokens (`bg-card`, `text-foreground`, `bg-secondary`, `text-muted-foreground`), so they follow the theme automatically — **prefer soft shadows over heavy effects**.
- Reusable utilities in `globals.css`: `.soft-shadow` (premium subtle elevation), `.glass`/`.glass-gold` (now light frosted white cards), `.glow-*` (kept as soft neutral shadows for compatibility). Cards use `rounded-2xl` + `.soft-shadow` + `hover:-translate-y-1` for a subtle lift.
- The homepage 3D route-visualization uses a `bg-navy` brand-accent section; immersive full-screen experiences (showroom, AR try-on/room/case, intro overlay) remain dark by design.
- `@/*` path alias maps to repo root (see `tsconfig.json`).
- Remote image hosts are allow-listed in `next.config.mjs`.
