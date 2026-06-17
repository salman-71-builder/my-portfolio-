# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository hosts **Import China** — a B2B wholesale sourcing e-commerce website (Bangladesh, importchina.com.bd) built with Next.js 14 (App Router), TypeScript, Tailwind CSS and shadcn/ui-style components.

## Repository

- **GitHub**: `salman-71-builder/my-portfolio-`
- **Purpose**: B2B wholesale sourcing platform ("Import China")

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint (`next lint`)

## Architecture

- `app/` — App Router pages: `/`, `/products`, `/products/[id]`, `/categories`, `/how-it-works`, `/about`, `/contact`, `/auth`, `/suppliers`. Root layout wires the cart provider, navbar, footer, cart drawer and mobile bottom nav.
- `components/ui/` — dependency-light shadcn-style primitives (Button, Card, Badge, Input, Label, Separator, Tabs, Slider, Sheet, Dialog).
- `components/sections/` — home page sections (hero, stats, category grid, featured/flash/new products, how-it-works, why-choose-us, suppliers showcase, testimonials, newsletter).
- `components/` — shared pieces: navbar, footer, search-bar (text + image search), product-card, cart-provider/cart-drawer (localStorage), product-detail, image-gallery, filter-sidebar, products-browser, etc.
- `data/` — dummy data: `products.ts` (30 products + `searchProducts`), `categories.ts` (12), `suppliers.ts`, `testimonials.ts`.
- `lib/utils.ts` — `cn()` and BDT currency formatting.

## Conventions

- Brand colors via Tailwind: `brand` (#CC0000) and `gold` (#FFD700); CSS variables in `app/globals.css`.
- `@/*` path alias maps to repo root (see `tsconfig.json`).
- Remote image hosts are allow-listed in `next.config.mjs`.
