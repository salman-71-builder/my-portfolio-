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

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Lucide React · next/image

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
