# LUMINA Digital Commerce

LUMINA adalah e-commerce produk digital berbasis Next.js, Supabase, Gemini AI, Tailwind CSS, dan Zustand.

## Stack

- Next.js Pages Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage, RPC
- Gemini AI via `@google/genai`
- Zustand cart store
- GitHub Actions CI

## Main Routes

- `/` catalog produk digital
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
- `/ai` persistent AI chat
- `/ai/history` riwayat AI chat
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
