# LUMINA Deployment Checklist

## 1. Supabase Database

Open Supabase Dashboard, go to SQL Editor, then run migrations in order:

1. `supabase/migrations/0001_profiles_products.sql`
2. `supabase/migrations/0002_orders.sql`
3. `supabase/migrations/0003_coupons.sql`
4. `supabase/migrations/0004_gamification.sql`
5. `supabase/migrations/0005_rls_core.sql`
6. `supabase/migrations/0006_rls_user_history.sql`
7. `supabase/migrations/0007_ai_chat.sql`

## 2. Supabase Storage

Create these buckets:

```txt
digital-products  private
product-images    public
```

Use `digital-products` for paid files and store the path in `products.file_path`.
Use `product-images` for cover images and store the public URL in `products.image_url`.

## 3. Supabase Auth

Enable Email Auth in Supabase. Configure redirect URLs:

```txt
http://localhost:3000
https://YOUR_DOMAIN.com
```

## 4. Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```env
NEXT_PUBLIC_APP_URL="https://YOUR_DOMAIN.com"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_ADMIN_EMAILS="owner@example.com"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` outside server environment variables.

## 5. Vercel Build Settings

Framework preset: Next.js

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

## 6. GitHub Actions CI

Workflow file:

```txt
.github/workflows/ci.yml
```

It runs:

```txt
npm install
npm run typecheck
npm run lint
npm run build
```

It can run automatically on push or manually using GitHub Actions → LUMINA CI → Run workflow.

## 7. Smoke Test Routes

After deploy, test these routes:

- `/`
- `/product/PRODUCT_SLUG`
- `/login`
- `/profile`
- `/premium`
- `/checkin`
- `/gift`
- `/cart`
- `/checkout`
- `/orders`
- `/download`
- `/ai`
- `/ai/history`
- `/admin`
- `/admin/products`
- `/admin/products/PRODUCT_ID`
- `/admin/orders`
- `/admin/users`
- `/admin/coupons`

## 8. Owner/Admin Setup

1. Signup/login using the owner email.
2. Put that email into `NEXT_PUBLIC_ADMIN_EMAILS`.
3. Open `/profile` once to create the profile row.
4. Open `/admin`.
5. Open `/admin/users` to toggle Premium/VIP status if needed.

## 9. Product Setup

1. Upload cover image to `product-images`.
2. Upload digital file to `digital-products`.
3. Open `/admin`.
4. Create product.
5. Fill `image_url` with the public image URL.
6. Fill `file_path` with the private digital file path.
7. Set product as published.
8. Open `/admin/products` to review and toggle publish/draft.
9. Open `/product/PRODUCT_SLUG` to verify the landing page.

## 10. Buyer Flow Test

1. Open `/`.
2. Open product detail.
3. Add product to cart.
4. Open `/cart`.
5. Open `/checkout`.
6. Create order.
7. Confirm success panel shows Order ID.
8. Open `/orders`.
9. Admin marks order fulfilled in `/admin/orders`.
10. Buyer opens `/download` and requests signed URL.

## 11. Coupon Flow

Coupon preview uses `/api/coupons/redeem`.
Coupon usage count is tracked only in `/api/orders/create` after a valid order is created.

## 12. Known Next Improvements

- Add payment gateway.
- Add email receipt.
- Add automatic download email after fulfillment.
- Add fully wired admin upload UI.
- Add product delete UI confirmation.
