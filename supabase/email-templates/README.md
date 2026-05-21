# DLAVIE Auth Email Templates

Template email premium DLAVIE untuk Supabase Auth berada di folder ini.

## Files

- `confirm-signup.html` untuk email konfirmasi akun baru.
- `recovery.html` untuk email recovery/reset akses akun.

## Cara memasang di Supabase

1. Buka Supabase Dashboard.
2. Masuk ke project DLAVIE.
3. Buka Authentication.
4. Buka Email Templates.
5. Pilih Confirm signup.
6. Copy isi `confirm-signup.html` ke editor template.
7. Pilih Reset password / Recovery.
8. Copy isi `recovery.html` ke editor template.
9. Save.

## Redirect URLs yang perlu diizinkan

Tambahkan URL berikut di Authentication > URL Configuration:

- `https://dlaviecomerce-git-dlavie-redesign-v1-dlavie.vercel.app/auth/confirmed`
- `https://dlaviecomerce-git-dlavie-redesign-v1-dlavie.vercel.app/reset-password`
- `https://dlaviecomerce-git-dlavie-redesign-v1-dlavie.vercel.app/login`

Jika production domain sudah final, tambahkan juga domain production final dengan path yang sama.

## Catatan keamanan

- Jangan tampilkan security score palsu.
- Jangan tampilkan jumlah device palsu.
- Jangan tampilkan status email verified jika belum berasal dari Supabase Auth.
- Device hanya masuk Trusted Devices jika user login dan menekan Trust Device.
- Login event hanya tercatat setelah user login valid atau confirmation redirect menghasilkan session.
