# Import China 🇨🇳 → 🇧🇩

**Bangladesh's #1 B2B Wholesale Sourcing Platform** — a modern e-commerce
website where buyers source wholesale products directly from China.
(Demo project inspired by chinacart.com.bd)

🌐 importchina.com.bd

## ✨ Features

- **Home page** — hero, stats bar, category grid, featured products slider,
  flash deals with live countdown, how-it-works, why-choose-us, new arrivals,
  supplier showcase marquee, auto-sliding testimonials, newsletter.
- **Products page** (`/products`) — sidebar filters (category, price slider,
  MOQ, rating, shipping time), sort, removable filter tags, pagination.
- **Smart search** — text search with category dropdown that writes to the URL,
  plus **visual search** by image URL, camera photo, or file upload.
- **Product detail** (`/products/[id]`) — zoomable image gallery, price range,
  MOQ badge, quantity selector, Add to Cart / Request Quote, supplier card, and
  Description / Specifications / Shipping / Reviews tabs, related products.
- **Categories, How It Works (timeline + FAQ), About, Contact, Auth** pages.
- **Cart** — add/update/remove with `localStorage` persistence, slide-out drawer,
  free-shipping progress, BDT totals.
- **Mobile-first** — hamburger drawer, touch sliders, bottom navigation bar.

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/) animations
- [Lucide React](https://lucide.dev/) icons
- `next/image` for optimized images

## 🚀 Getting Started

```bash
npm install
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # lint
```

## 📁 Structure

```
app/              # App Router pages (home, products, categories, etc.)
components/       # UI + feature components (navbar, footer, product-card…)
components/ui/    # shadcn/ui primitives
context/          # cart context (localStorage)
data/             # dummy products, categories, suppliers, testimonials
lib/              # utils + helpers
```

## 🎨 Branding

| Token   | Value     |
| ------- | --------- |
| Primary | `#CC0000` |
| Accent  | `#FFD700` |
| Font    | Inter     |

> Product data is dummy/sample data for demonstration. Images are served from
> Unsplash / placehold.co.
