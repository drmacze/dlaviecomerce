# LUMINA / DLAVIE Digital Commerce

LUMINA / DLAVIE adalah e-commerce produk digital berbasis Next.js, Supabase, Gemini AI, Tailwind CSS, Zustand, dan DLAVIE Experience Engine.

## Stack

- Next.js Pages Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage, RPC
- Gemini AI via `@google/genai`
- Zustand cart store
- TanStack Query server-state cache
- Lenis smooth scroll
- GSAP + `@gsap/react` advanced animation runtime
- Framer Motion global motion configuration
- Three.js + React Three Fiber + Drei WebGL ambient layer
- CMDK command palette
- Sonner toast system
- GitHub Actions CI

## DLAVIE Experience Engine 2.0

This repo includes a full-site experience layer, not only isolated component registry code.

### Global UX upgrades

- `DlavieExperienceShell` wraps the whole app from `pages/_app.tsx`.
- `DlavieSiteDock` adds global bottom navigation for core routes.
- `DlavieCommandPalette` adds `Ctrl/⌘ + K` navigation.
- `DlaviePageProgress` adds route transition feedback.
- `DlavieProviders` now includes theme support, tuned TanStack Query defaults, smoother Lenis config, and improved toast styling.
- `AmbientBg` now combines CSS prism layers with a dynamic WebGL holographic scene.
- `styles/dlavie-experience.css` applies cross-site polish: focus rings, premium glass, motion safety, kinetic card states, dock spacing, and reduced-motion handling.

### Main engine files

```txt
components/dlavie-experience-shell.tsx
components/dlavie-site-dock.tsx
components/dlavie-command-palette.tsx
components/dlavie-page-progress.tsx
components/dlavie-holographic-scene.tsx
components/ambient-bg.tsx
lib/dlavie-experience.ts
hooks/use-reduced-motion.ts
styles/dlavie-experience.css
```

## Main Routes

- `/` catalog dan opening experience
- `/products` produk digital / PPOB
- `/product/[slug]` detail produk digital
- `/login` auth Supabase
- `/profile` profil user, Premium/VIP, L-Points
- `/premium` premium center
- `/orders` riwayat pembelian
- `/cart` cart lokal
- `/checkout` checkout order
- `/download` akses download produk digital
- `/checkin` daily check-in L-Points
- `/gift` kirim L-Points
- `/wallet` D-Balance dan top up
- `/rewards` rewards dan VIP benefits
- `/ai` persistent AI chat
- `/ai/history` riwayat AI chat
- `/dashboard` pusat kontrol user
- `/admin` admin product creator
- `/admin/products` admin product manager
- `/admin/products/[id]` admin product editor
- `/admin/orders` order management
- `/admin/users` user/Premium management
- `/admin/coupons` coupon creator

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill these values:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_ADMIN_EMAILS="owner@example.com"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## Local Development

```bash
npm install
npm run dev
```

## Production Checks

```bash
npm run typecheck
npm run lint
npm run build
```

Or run the full quality gate:

```bash
npm run check
```

## Supabase Setup

Run migrations in `supabase/migrations` in order, then create Storage buckets:

```txt
digital-products  private
product-images    public
```

`digital-products` stores paid files. `product-images` stores public cover images.

## Buyer Flow

```txt
Homepage → Product Detail → Cart → Checkout → Orders → Download
```

Checkout creates the order through `/api/orders/create`. Coupon usage is tracked only inside the order creation flow.

## Admin Flow

```txt
Login as owner → /admin → create product → /admin/products → edit/publish product → /admin/orders → mark fulfilled
```

## CI

The repository includes `.github/workflows/ci.yml` for:

```txt
npm install
npm run typecheck
npm run lint
npm run build
```

See `docs/deployment-checklist.md` for the full deployment checklist.
