# PPOB Auto Sync Notes

Branch PPOB sudah memiliki helper `lib/ppob-sync.ts`.

Untuk membuat sync Digiflazz otomatis di Vercel, tambahkan dua file:

1. `pages/api/cron/ppob.ts`
2. `vercel.json`

Endpoint cron cukup memanggil `syncDigiflazzPrepaidProducts()`.

Jadwal yang disarankan: setiap 6 jam.

Setelah deploy, isi environment variables Digiflazz dan cron token di Vercel.
