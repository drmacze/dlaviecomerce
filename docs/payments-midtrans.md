# DLAVIE Midtrans Payment Setup

DLAVIE sudah disiapkan untuk topup otomatis via Midtrans Snap + webhook.

## Environment variables

Tambahkan di Vercel Project Settings > Environment Variables:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_SITE_URL=https://dlaviecomerce-git-dlavie-redesign-v1-dlavie.vercel.app
```

Saat production:

```env
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_SITE_URL=https://domain-production-dlavie.com
```

## Webhook URL

Masukkan URL ini di dashboard Midtrans sebagai Payment Notification URL:

```txt
https://domain-production-dlavie.com/api/payments/midtrans-webhook
```

Untuk branch preview:

```txt
https://dlaviecomerce-git-dlavie-redesign-v1-dlavie.vercel.app/api/payments/midtrans-webhook
```

## Flow

1. User pilih nominal di `/wallet`.
2. User klik `Bayar Otomatis`.
3. `/api/wallet/topup-auto` membuat transaksi Snap Midtrans.
4. User diarahkan ke halaman pembayaran Midtrans.
5. Midtrans mengirim webhook ke `/api/payments/midtrans-webhook`.
6. Webhook memvalidasi signature.
7. Jika status settlement/capture valid, sistem menambah `profiles.d_balance`.
8. `wallet_transactions.status` menjadi `approved`.

## Manual fallback

BRI, Dana, Gopay, dan QRIS statis tetap tersedia sebagai fallback manual dan akan masuk ke `/admin/topups` untuk approve/reject.
