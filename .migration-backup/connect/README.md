# DLAVIE Connect Bot

Adapter external untuk bot DLAVIE. Folder ini disiapkan untuk dijalankan di VPS, Pterodactyl, Railway, Render, atau environment Node.js long-running lain.

Website utama tetap berjalan di Vercel. Bot external ini berfungsi sebagai proses hidup terus yang menerima pesan WhatsApp/Telegram, lalu berkomunikasi dengan API website DLAVIE.

## Struktur

```txt
connect/
├─ package.json
└─ src/
   ├─ config.js
   ├─ server.js
   ├─ whatsapp.js
   └─ telegram.js
```

## Environment

Buat file `.env` di folder `connect`:

```env
PORT=8787
DLAVIE_APP_URL=https://dlaviecomerce.vercel.app
WHATSAPP_MODE=manual
WHATSAPP_OWNER_NUMBER=628xxxxxxxxxx
TELEGRAM_BOT_TOKEN=
TELEGRAM_MODE=off
```

## Jalankan local/VPS

```bash
cd connect
npm install
npm start
```

Health check:

```bash
curl http://localhost:8787/health
```

Manual WhatsApp command test:

```bash
curl -X POST http://localhost:8787/webhook/whatsapp/manual \
  -H "Content-Type: application/json" \
  -d '{"from":"628xxxxxxxxxx","message":"menu"}'
```

Command tersedia:

```txt
menu
ping
status
panel
ppob
```

## Catatan penting

Tahap ini adalah adapter manual-ready. Untuk WhatsApp real-time, tambahkan Baileys atau WhatsApp Cloud API di atas `handleWhatsappCommand()`.

Rekomendasi deployment:

```txt
Vercel: website utama dan API
Supabase: database
Pterodactyl/VPS: WhatsApp Baileys bot
Telegram: bisa dari VPS atau webhook
```
