# Panduan Maintenance dan Pengembangan Data

Dokumen ini menjelaskan bagaimana mengelola data, skema database, dan konfigurasi aplikasi agar aplikasi tetap fleksibel dan mudah dipelihara.

## 1. Pemisahan Data dan Aplikasi

Aplikasi ini dirancang untuk memisahkan **logika aplikasi** (coding) dengan **data** (database/konfigurasi).

### A. Data Referensi (Contoh: Kabupaten/Kota)
Data referensi seperti daftar Kabupaten/Kota **TIDAK** boleh di-hardcode di dalam file `.tsx` atau `.ts`.
- **Benar**: Simpan di tabel database (`kabupaten_kota`), buat API endpoint, dan fetch di frontend.
- **Salah**: Menulis `<option value="SBY">Surabaya</option>` langsung di code.

**Cara Penggunaan:**
1. Pastikan tabel referensi ada di database.
2. Gunakan endpoint seperti `/api/kabupaten` untuk mengambil data.
3. Di frontend, gunakan state dan map data tersebut ke UI.

### B. Konfigurasi Aplikasi (Settings)
Informasi seperti Nama Aplikasi, Logo, Alamat Instansi, dll disimpan di tabel `settings`.
- **Tabel**: `settings` (key, value, description)
- **API**: `/api/settings`
- **Frontend**: Fetch data ini di `layout.tsx` atau Context dan gunakan di seluruh aplikasi.

## 2. Skenario Penambahan Tabel/Kolom (Database Migration)

Jika Anda perlu menambah tabel baru atau kolom baru pada tabel yang sudah ada, **JANGAN** menjalankannya secara manual di database production. Gunakan sistem **Migration**.

### Langkah-langkah:
1. **Buat File Migrasi SQL**
   Buat file `.sql` baru di folder `database/migrations/`. Beri penomoran urut agar tereksekusi sesuai urutan.
   Contoh: `database/migrations/002_add_email_users.sql`

   ```sql
   -- Isi file 002_add_email_users.sql
   ALTER TABLE users ADD COLUMN email_alternatif VARCHAR(100);
   ```

2. **Jalankan Script Migrasi**
   Buka terminal dan jalankan:
   ```bash
   node scripts/migrate_runner.js
   ```

   Script ini akan:
   - Mengecek tabel `_migrations` untuk melihat migrasi mana yang sudah dijalankan.
   - Menjalankan file `.sql` baru yang belum tereksekusi.
   - Mencatat migrasi yang berhasil ke tabel `_migrations`.

### Keuntungan:
- **Terkontrol**: Semua perubahan struktur database terdokumentasi dalam file.
- **Aman**: Script otomatis mengecek dan tidak menjalankan migrasi yang sama dua kali.
- **Mudah Deploy**: Saat pindah server, cukup jalankan script ini untuk menyamakan struktur database.

## 3. Skenario Pemindahan Server/Database

Jika aplikasi perlu dipindahkan ke server atau provider database baru:

1. **Persiapkan Database Baru**
   - Buat database kosong di server baru.
   - Pastikan Anda memilik credentials (Host, User, Password, DB Name).

2. **Update Environment Variables**
   - Edit file `.env.local` (atau environment variable di hosting seperti Vercel).
   - Update `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, dll.

3. **Jalankan Migrasi**
   - Jalankan `node scripts/migrate_runner.js`.
   - Script akan otomatis membuat semua tabel (mulai dari `001_...` dst) jika database kosong.
   
   *Catatan: Jika Anda memiliki `dump` data lama (file .sql besar berisi data), Anda bisa meng-importnya terlebih dahulu, lalu jalankan migration runner untuk memastikan struktur terbaru teros dipalikasikan.*

## 4. Troubleshooting Koneksi

Jika script migrasi gagal dengan error `Access denied` atau `ECONNREFUSED`:
1. Cek `.env.local` pastikan tidak ada typo.
2. Pastikan IP server Anda diizinkan (whitelist) jika menggunakan Cloud Database (seperti TiDB/Supabase).
3. Cek apakah password yang mengandung karakter khusus sudah ter-escape dengan benar atau dibungkus quote jika diperlukan.
