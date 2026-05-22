# LUMINA Digital Commerce

LUMINA adalah e-commerce produk digital berbasis Next.js, Supabase, Gemini AI, Tailwind CSS, Zustand, Midtrans wallet topup, dan Digiflazz PPOB automation.

## Stack

- Next.js Pages Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage, RPC
- Gemini AI via `@google/genai`
- Zustand cart store
- Midtrans webhook for automatic D-Balance topup
- Digiflazz API for PPOB products and transactions
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
- `/wallet` D-Balance wallet dan topup otomatis
- `/ppob` PPOB otomatis untuk topup game, pulsa, data, token, dan voucher digital
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
- `/admin/ppob` PPOB sync, product sync, dan riwayat transaksi PPOB

## API Routes

- `GET /api/ppob/products` lists active PPOB products.
- `GET /api/ppob/order` lists the current user's PPOB orders.
- `POST /api/ppob/order` creates a PPOB order paid by D-Balance.
- `POST /api/admin/ppob-sync` syncs Digiflazz prepaid products into Supabase.
- `POST /api/ppob/digiflazz-webhook` receives Digiflazz transaction callbacks.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill these values:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_ADMIN_EMAILS="owner@example.com"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

MIDTRANS_SERVER_KEY="YOUR_MIDTRANS_SERVER_KEY"
MIDTRANS_IS_PRODUCTION="false"

DIGIFLAZZ_USERNAME="YOUR_DIGIFLAZZ_USERNAME"
DIGIFLAZZ_API_KEY="YOUR_DIGIFLAZZ_API_KEY"
DIGIFLAZZ_BASE_URL="https://api.digiflazz.com"
DIGIFLAZZ_TESTING="true"
DIGIFLAZZ_CALLBACK_URL="http://localhost:3000/api/ppob/digiflazz-webhook"
DIGIFLAZZ_WEBHOOK_SECRET="YOUR_DIGIFLAZZ_WEBHOOK_SECRET"

PPOB_DEFAULT_MARGIN="1500"
PPOB_MARGIN_PULSA="1000"
PPOB_MARGIN_DATA="1500"
PPOB_MARGIN_GAME="1500"
PPOB_MARGIN_PLN="1500"
PPOB_MARGIN_VOUCHER="1500"
```

For production, set `DIGIFLAZZ_TESTING="false"` and use the deployed webhook URL, for example:

```env
DIGIFLAZZ_CALLBACK_URL="https://your-domain.com/api/ppob/digiflazz-webhook"
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
Wallet → PPOB → Select Product → Pay with D-Balance → Provider Processing → SN/Status Update
```

Checkout creates the order through `/api/orders/create`. Coupon usage is tracked only inside the order creation flow.

PPOB checkout creates the order through `/api/ppob/order`, deducts D-Balance, submits the transaction to Digiflazz, and updates the order from the initial provider response or webhook callback. Failed provider statuses create a wallet refund mutation automatically.

## Admin Flow

```txt
Login as owner → /admin → create product → /admin/products → edit/publish product → /admin/orders → mark fulfilled
Login as owner → /admin/ppob → sync products → monitor PPOB orders
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
