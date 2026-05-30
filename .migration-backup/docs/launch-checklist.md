# LUMINA Final Launch Checklist

Use this checklist when launching from mobile.

## 1. Supabase

- Run every SQL migration from `supabase/migrations` in order.
- Create Storage buckets:
  - `digital-products` as private
  - `product-images` as public
- Enable Email Auth.
- Add redirect URLs:
  - `http://localhost:3000`
  - `https://YOUR_DOMAIN.com`

## 2. Vercel Environment Variables

Add all variables before deploy:

```env
NEXT_PUBLIC_APP_URL="https://YOUR_DOMAIN.com"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_ADMIN_EMAILS="owner@example.com"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## 3. Deploy

- Import GitHub repo into Vercel.
- Framework preset: Next.js.
- Build command: `npm run build`.
- Deploy branch: `main`.

## 4. Owner Setup

- Login with owner email.
- Open `/profile` once.
- Open `/admin`.
- Create the first product.
- Open `/admin/products` and confirm product is published.

## 5. Buyer Smoke Test

- Open `/`.
- Open `/product/PRODUCT_SLUG`.
- Add product to cart.
- Open `/cart`.
- Open `/checkout`.
- Create order.
- Copy Order ID from success panel.
- Open `/admin/orders` as owner.
- Mark order as `fulfilled`.
- Open `/download`.
- Enter buyer email, Order ID, and Product ID.
- Confirm signed download link appears.

## 6. AI Smoke Test

- Open `/ai`.
- Send one message.
- Open `/ai/history`.
- Reopen the chat session.

## 7. Gamification Smoke Test

- Open `/checkin`.
- Claim daily points.
- Open `/gift`.
- Send points to another registered email.

## 8. Premium Smoke Test

- Open `/premium`.
- Open `/admin/users`.
- Toggle Premium/VIP for the user.
- Reopen `/premium` and confirm status changes.

## 9. Final Go/No-Go

Launch is ready when:

- Homepage loads published products.
- Product detail page opens.
- Checkout creates an order.
- Admin can fulfill order.
- Download works only after fulfillment.
- AI chat responds.
- Check-in works once per day.
- Premium status is visible.
- GitHub Actions or Vercel build passes.
