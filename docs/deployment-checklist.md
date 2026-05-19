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
Use `product-images` for product cover images and store the public URL in `products.image_url`.

Admin signed upload endpoint:

```txt
POST /api/admin/upload-url
```

It accepts `bucket` and `fileName`, then returns a signed upload token. Allowed buckets are `digital-products` and `product-images`.

## 3. Supabase Auth

Enable Email Auth in Supabase. If using local testing, configure redirect URLs:

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

## 6. Smoke Test Routes

After deploy, test these routes:

- `/`
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
- `/admin/orders`
- `/admin/users`
- `/admin/coupons`

## 7. Owner/Admin Setup

1. Signup/login using the owner email.
2. Put that email into `NEXT_PUBLIC_ADMIN_EMAILS`.
3. Open `/profile` once to create the profile row.
4. Open `/admin`.

## 8. Product Setup

1. Upload product image to `product-images`.
2. Upload digital file to `digital-products`.
3. Open `/admin`.
4. Create product.
5. Fill `image_url` with the public product image URL.
6. Fill `file_path` with the private digital file path.
7. Set product as published.

## 9. Order Fulfillment

1. Buyer checks out.
2. Admin opens `/admin/orders`.
3. Admin marks order as `fulfilled`.
4. Buyer opens `/orders` then `/download`.

## 10. Known Next Improvements

- Add payment gateway.
- Add email receipt.
- Add automatic download email after fulfillment.
- Add product edit/delete UI.
- Add fully wired admin upload UI.
