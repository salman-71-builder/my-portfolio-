# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Import China** — a Bangladesh-based B2B wholesale sourcing e-commerce website
where buyers source products directly from China. Built with Next.js 14.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (statically prerenders all routes)
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (`next lint`)

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with CSS-variable theming (brand red `#CC0000`, gold `#FFD700`)
- **shadcn/ui** primitives in `components/ui/`
- **Framer Motion** for animations, **Lucide React** for icons
- `next/image` (remote images allowed from Unsplash / placehold.co — see `next.config.mjs`)

## Architecture

- `app/` — App Router pages. Pages that need `useSearchParams` (`/products`,
  `/auth`) render a client component wrapped in `<Suspense>`.
- `components/` — feature components (navbar, footer, product-card, hero, etc.).
- `components/ui/` — shadcn/ui primitives (button, card, dialog, sheet, tabs,
  slider, select, accordion, badge, input, label).
- `context/cart-context.tsx` — cart state via React Context, persisted to
  `localStorage` under `import-china-cart`. Use the `useCart()` hook.
- `data/` — typed dummy data: `products.ts` (30 products), `categories.ts`
  (12 categories), `suppliers.ts`, `testimonials.ts`. Each exposes helper
  selectors (e.g. `getProductById`, `getProductsByCategory`).
- `lib/utils.ts` — `cn()` class merger and `formatBDT()` currency helper.
- `lib/category-icons.ts` — maps category icon names to Lucide components.

## Conventions

- Currency is Bangladeshi Taka; format with `formatBDT()` from `lib/utils`.
- Filtering/search/sort on `/products` is driven by URL query params
  (`search`, `category`, `sort`, `visual`, `imageUrl`) in `products-client.tsx`.
- Brand colors are theme tokens: use `text-primary`, `bg-brand-gold`, etc.
- Keep new dummy data in `data/` and reference categories by `slug`.
