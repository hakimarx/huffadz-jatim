# Panduan Setting Vercel dan Supabase

Aplikasi `huffadz-jatim` membutuhkan konfigurasi Environment Variables agar dapat berjalan dengan baik di Vercel.

## 1. Environment Variables di Vercel

Buka dashboard project Anda di Vercel, masuk ke **Settings** > **Environment Variables**, dan tambahkan key-value berikut:

### Database (MySQL Compatible)
Aplikasi ini menggunakan `mysql2`. Anda HARUS memiliki database MySQL/MariaDB/TiDB yang dapat diakses secara public (bukan localhost).

- `DATABASE_HOST`: Host database remote (contoh: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
- `DATABASE_USER`: Username database
- `DATABASE_PASSWORD`: Password database
- `DATABASE_NAME`: Nama database (default: `huffadz_jatim`)
- `DATABASE_PORT`: Port database (default: `4000` untuk TiDB atau `3306` untuk MySQL biasa)
- `DATABASE_SSL`: `true` (jika menggunakan TiDB/AWS RDS yang butuh SSL)

### Supabase (Storage)
Digunakan untuk menyimpan file foto/dokumen.

- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Anon Key Supabase Anda

### App Configuration
- `NEXT_PUBLIC_BASE_URL`: URL aplikasi Vercel Anda (contoh: `https://huffadz-jatim.vercel.app`)
- `NEXTAUTH_URL`: Sama dengan `NEXT_PUBLIC_BASE_URL`
- `SESSION_SECRET`: String acak panjang (min 32 karakter) untuk enkripsi session
- `NODE_ENV`: `production`

### Email (Resend)
- `RESEND_API_KEY`: API Key dari Resend.com

---

## 2. Catatan Penting
1. **Fitur WhatsApp**: Server WA (`scripts/wa-server.js`) tidak dapat berjalan di Vercel Serverless Function secara persistent. Fitur notifikasi WA mungkin tidak berjalan kecuali Anda menghosting server WA secara terpisah (misal di VPS) dan mengisi `WA_SERVER_URL`.
2. **Database**: Jika Anda belum punya database remote, disarankan menggunakan **TiDB Cloud** (gratis 5GB, kompatibel MySQL) atau **Supabase Postgres** (namun perlu migrasi kode dr `mysql2` ke `postgres`). Saat ini kode masih menggunakan `mysql2`.
