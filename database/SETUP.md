# 🗄️ Setup Database Supabase

Panduan lengkap setup database untuk Sistem Pendataan Huffadz Jawa Timur.

## 📝 Langkah-Langkah Setup

### 1. Buat Akun Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Klik **"Start your project"**
3. Sign up dengan GitHub atau Email
4. Verifikasi email Anda

### 2. Buat Project Baru

1. Setelah login, klik **"New Project"**
2. Isi form:
   - **Name**: `huffadz-jatim`
   - **Database Password**: Buat password yang kuat (simpan baik-baik!)
   - **Region**: Pilih `Southeast Asia (Singapore)` untuk performa terbaik
   - **Pricing Plan**: Pilih **Free** (cukup untuk development)
3. Klik **"Create new project"**
4. Tunggu 2-3 menit sampai project selesai dibuat

### 3. Jalankan SQL Schema

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon ⚡ di sidebar kiri)
2. Klik **"New query"**
3. Buka file `database/schema.sql` dari project ini
4. Copy semua isi file dan paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl + Enter`
6. Tunggu sampai muncul notifikasi **"Success. No rows returned"**

✅ Database Anda sekarang sudah memiliki:
- 12 tabel utama
- Row Level Security (RLS) policies
- Views untuk reporting
- Triggers untuk auto-update timestamps
- Sample data kabupaten/kota dan periode tes

### 4. Verifikasi Database

1. Buka menu **Table Editor** (ikon 📊 di sidebar)
2. Pastikan tabel-tabel berikut sudah ada:
   - ✅ users
   - ✅ kabupaten_kota (38 rows)
   - ✅ periode_tes (8 rows)
   - ✅ hafiz
   - ✅ laporan_harian
   - ✅ kuota
   - ✅ penguji
   - ✅ jadwal_tes
   - ✅ absensi_tes
   - ✅ penugasan_penguji
   - ✅ dokumen

### 5. Setup Authentication

1. Buka menu **Authentication** > **Providers**
2. Pastikan **Email** provider sudah enabled
3. (Opsional) Aktifkan **Google** atau **GitHub** provider jika ingin social login

### 6. Konfigurasi Storage (untuk upload foto)

1. Buka menu **Storage**
2. Klik **"Create a new bucket"**
3. Buat bucket dengan nama: `laporan-photos`
   - Public bucket: **Yes** (agar foto bisa diakses)
4. Klik **"Create bucket"**
5. Ulangi untuk bucket: `ktp-photos` dan `dokumen`

### 7. Setup Row Level Security (RLS) Policies

RLS sudah otomatis dibuat dari schema.sql, tapi verifikasi:

1. Buka **Table Editor** > pilih tabel `hafiz`
2. Klik **"RLS"** tab
3. Pastikan ada 3 policies:
   - ✅ Hafiz can view own data
   - ✅ Admin kabko can view hafiz in their region
   - ✅ Admin provinsi can view all hafiz

### 8. Dapatkan API Credentials

1. Buka menu **Settings** > **API**
2. Copy credentials berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (API Key yang panjang)

### 9. Update Environment Variables

1. Buka file `.env.local` di root project
2. Update dengan credentials Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 10. Test Koneksi

1. Restart development server:
```bash
npm run dev
```

2. Buka browser: `http://localhost:3000`
3. Coba login dengan demo account atau register baru

## 🔐 Membuat User Admin

Untuk membuat user admin pertama kali:

### Via Supabase Dashboard:

1. Buka **Authentication** > **Users**
2. Klik **"Add user"** > **"Create new user"**
3. Isi:
   - Email: `admin.provinsi@lptq.jatimprov.go.id`
   - Password: `admin123` (atau password lain)
   - Auto Confirm User: **Yes**
4. Klik **"Create user"**

5. Setelah user dibuat, buka **Table Editor** > **users**
6. Klik **"Insert"** > **"Insert row"**
7. Isi:
   - id: (copy dari auth.users id yang baru dibuat)
   - email: `admin.provinsi@lptq.jatimprov.go.id`
   - role: `admin_provinsi`
   - nama: `Admin Provinsi LPTQ`
   - is_active: `true`
8. Klik **"Save"**

Ulangi untuk Admin Kab/Ko dan Hafiz sesuai kebutuhan.

## 📊 Import Data Excel Existing

Jika Anda punya data Excel 14,349 Huffadz:

1. Buka Excel, export ke CSV
2. Buka Supabase **Table Editor** > **hafiz**
3. Klik **"Insert"** > **"Import data from CSV"**
4. Upload file CSV
5. Map kolom Excel ke kolom database
6. Klik **"Import"**

## 🔄 Backup Database

Untuk backup data:

1. Buka **Database** > **Backups**
2. Klik **"Create backup"**
3. Download backup file

## 🚨 Troubleshooting

### Error: "relation does not exist"
- Pastikan schema.sql sudah dijalankan dengan benar
- Cek di Table Editor apakah tabel sudah ada

### Error: "JWT expired" atau "Invalid API key"
- Cek kembali NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local
- Pastikan tidak ada spasi atau karakter tambahan

### Error: "Row Level Security policy violation"
- Pastikan user sudah ada di tabel `users`
- Cek role user sudah sesuai
- Verifikasi RLS policies sudah aktif

### Tidak bisa upload foto
- Pastikan bucket sudah dibuat
- Cek bucket policy (harus public untuk read)
- Verifikasi file size tidak melebihi limit

## 📞 Bantuan

Jika ada masalah:
1. Cek [Supabase Documentation](https://supabase.com/docs)
2. Join [Supabase Discord](https://discord.supabase.com)
3. Baca error message dengan teliti

## ✅ Checklist Setup

- [ ] Akun Supabase dibuat
- [ ] Project baru dibuat
- [ ] Schema.sql dijalankan
- [ ] Tabel terverifikasi (12 tabel)
- [ ] Storage buckets dibuat (3 buckets)
- [ ] API credentials dicopy
- [ ] .env.local diupdate
- [ ] User admin dibuat
- [ ] Test koneksi berhasil

Selamat! Database Anda sudah siap digunakan! 🎉
