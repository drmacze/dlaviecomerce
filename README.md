# LUMINA Digital Commerce

LUMINA adalah e-commerce produk digital berbasis Next.js, Supabase, Gemini AI, Tailwind CSS, dan Zustand.

## Stack

- Next.js Pages Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage, RPC
- Gemini AI via `@google/genai`
- Zustand cart store

## Main Routes

- `/` catalog produk digital
- `/login` auth Supabase
- `/profile` profil user, VIP, L-Points
- `/orders` riwayat pembelian
- `/cart` cart lokal
- `/checkout` checkout order
- `/download` akses download produk digital
- `/checkin` daily check-in L-Points
- `/gift` kirim L-Points
- `/ai` customer service AI
- `/admin` admin product creator
- `/admin/orders` order management
- `/admin/users` user/VIP management
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

Run migrations in `supabase/migrations` in order, then create a private Storage bucket named:

```txt
digital-products
```

See `docs/deployment-checklist.md` for the full deployment checklist.
