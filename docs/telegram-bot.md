# Dlavie Telegram Bot

Integrasi ini menambahkan bot Telegram untuk notifikasi order dan command ringan admin Dlavie.

## Fitur

- Webhook Telegram di `/api/telegram/webhook`
- Setup webhook otomatis di `/api/telegram/setup-webhook`
- Notifikasi admin saat order baru dibuat melalui `/api/orders/create`
- Command bot:
  - `/start`
  - `/help`
  - `/myid`
  - `/status`
  - `/ping`
  - `/admin_stats`
  - `/test_order`

## Environment Variables

Isi di Vercel Project Settings → Environment Variables, bukan di kode.

```env
TELEGRAM_BOT_TOKEN="TOKEN_BARU_DARI_BOTFATHER"
DLAVIE_ADMIN_IDS="123456789"
TELEGRAM_WEBHOOK_SECRET="random-secret-panjang"
TELEGRAM_SETUP_KEY="random-setup-key-panjang"
NEXT_PUBLIC_APP_URL="https://domain-dlavie-kamu.vercel.app"
```

Gunakan token baru dari BotFather. Jangan pakai token yang pernah dikirim ke chat publik atau assistant.

## Cara setup dari HP

1. Buka Telegram → `@BotFather`.
2. Jalankan `/mybots` → pilih bot Dlavie → `API Token` → `Revoke current token`.
3. Salin token baru.
4. Buka Vercel dari browser HP.
5. Masuk ke project Dlavie.
6. Buka `Settings` → `Environment Variables`.
7. Tambahkan env di atas.
8. Redeploy project.
9. Buka URL berikut di browser:

```txt
https://domain-dlavie-kamu.vercel.app/api/telegram/setup-webhook?key=ISI_TELEGRAM_SETUP_KEY
```

Jika berhasil, response akan berisi `ok: true` dari Telegram.

## Ambil Chat ID Admin

Setelah webhook aktif, buka bot Dlavie di Telegram dan kirim:

```txt
/myid
```

Masukkan angka yang dikirim bot ke env:

```env
DLAVIE_ADMIN_IDS="chat_id_kamu"
```

Lalu redeploy lagi.

## Test

Kirim command berikut ke bot:

```txt
/test_order
```

Jika pesan test masuk, notifikasi order Dlavie sudah aktif.

## Catatan keamanan

- Jangan commit token Telegram ke GitHub.
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, atau secret lain ke repository.
- Gunakan environment variables di Vercel/Supabase dashboard.
- Jika secret pernah terekspos, rotate/revoke secret tersebut.
