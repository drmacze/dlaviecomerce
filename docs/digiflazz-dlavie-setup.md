# Digiflazz Setup for Dlavie Commerce

Panduan ini dibuat agar Dlavie Commerce siap dipakai dengan Digiflazz. Setelah kode PPOB di-merge dan deploy ke Vercel, kamu hanya perlu mengisi environment variables.

## 1. Pilihan koneksi di Digiflazz

Gunakan koneksi API/custom website.

Rekomendasi isian:

- Koneksi: API
- Software: Custom / Lainnya / Website Sendiri
- Nama aplikasi: Dlavie Commerce
- Callback URL: https://DOMAIN-KAMU.com/api/ppob/digiflazz-webhook

Jangan pilih Otomax, IRS, FlashMachine, atau software server pulsa lain kalau kamu tidak memakai software itu.

## 2. Data yang perlu diambil dari Digiflazz

Ambil data berikut dari dashboard Digiflazz:

- Username
- API Key development atau production
- Webhook secret jika tersedia

Simpan data tersebut hanya di Vercel Environment Variables. Jangan commit token/API key ke GitHub.

## 3. Environment Variables di Vercel

Isi di Vercel Project Settings > Environment Variables:

```env
CRON_SECRET="buat_string_random_panjang"
DIGIFLAZZ_USERNAME="username_digiflazz"
DIGIFLAZZ_API_KEY="api_key_digiflazz"
DIGIFLAZZ_BASE_URL="https://api.digiflazz.com"
DIGIFLAZZ_TESTING="false"
DIGIFLAZZ_CALLBACK_URL="https://DOMAIN-KAMU.com/api/ppob/digiflazz-webhook"
DIGIFLAZZ_WEBHOOK_SECRET="secret_webhook_digiflazz"
PPOB_DEFAULT_MARGIN="1500"
PPOB_MARGIN_PULSA="1000"
PPOB_MARGIN_DATA="1500"
PPOB_MARGIN_GAME="1500"
PPOB_MARGIN_PLN="1500"
PPOB_MARGIN_VOUCHER="1500"
```

Untuk testing awal, gunakan:

```env
DIGIFLAZZ_TESTING="true"
```

Untuk production, gunakan:

```env
DIGIFLAZZ_TESTING="false"
```

## 4. Setelah deploy

1. Jalankan migration Supabase.
2. Deploy branch ke Vercel.
3. Isi env Vercel.
4. Redeploy project.
5. Vercel Cron akan sync produk otomatis setiap 6 jam.
6. Admin tetap bisa sync manual dari `/admin/ppob`.
7. Buyer bisa transaksi dari `/ppob`.

## 5. Endpoint penting

- Produk PPOB: `/api/ppob/products`
- Order PPOB: `/api/ppob/order`
- Webhook Digiflazz: `/api/ppob/digiflazz-webhook`
- Cron sync produk: `/api/cron/ppob-products`
- Admin PPOB: `/admin/ppob`
- Buyer PPOB: `/ppob`

## 6. Checklist keamanan

- Jangan membagikan API key Digiflazz.
- Jangan membagikan kode Google Authenticator.
- Jangan commit `.env.local` ke GitHub.
- Pakai Production Key hanya saat siap live.
- Test nominal kecil terlebih dahulu sebelum membuka PPOB untuk user umum.
