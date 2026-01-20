# Panduan Setup Database Supabase

## ⚠️ PENTING - Jalankan Script Ini Terlebih Dahulu!

Jika Anda mengalami error seperti:
- `column hafiz.jenis_kelamin does not exist`
- `Could not find the 'kabupaten_kota' column`
- Tidak bisa upload Excel

Ikuti langkah-langkah berikut:

## 📋 Langkah-Langkah Setup

### 1. Login ke Supabase Dashboard

1. Buka https://supabase.com
2. Login dengan akun Anda
3. Pilih project **huffadz-jatim** (atau nama project Anda)

### 2. Jalankan Schema Utama

1. Klik menu **SQL Editor** di sidebar kiri
2. Klik tombol **New Query**
3. Copy seluruh isi file `database/schema.sql`
4. Paste ke SQL Editor
5. Klik tombol **Run** (atau tekan Ctrl+Enter)
6. Tunggu sampai selesai (biasanya 5-10 detik)
7. Pastikan muncul pesan sukses

### 3. Perbaiki Schema Hafiz (WAJIB!)

1. Masih di **SQL Editor**, buat query baru
2. Copy seluruh isi file `database/fix_hafiz_schema.sql`
3. Paste ke SQL Editor
4. Klik **Run**
5. Periksa output - pastikan semua kolom muncul:
   - `jenis_kelamin`
   - `kabupaten_kota`
   - `tempat_mengajar`
   - `status_insentif`
   - `keterangan`
   - dll (total harus ada ~30 kolom)

### 4. Insert Admin Users

1. Buat query baru di SQL Editor
2. Copy isi file `database/insert_admin_users.sql`
3. Paste dan **Run**
4. Atau buat manual via Dashboard (lihat `ADMIN_ACCOUNTS.md`)

### 5. Verifikasi Setup

Jalankan query berikut untuk memastikan semua sudah benar:

```sql
-- Cek tabel hafiz
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;

-- Cek jumlah kabupaten/kota
SELECT COUNT(*) as total_kabko FROM kabupaten_kota;
-- Harus ada 38 kabupaten/kota

-- Cek periode tes
SELECT tahun, nama_periode, status FROM periode_tes ORDER BY tahun;
-- Harus ada periode 2015-2024

-- Cek admin users
SELECT email, role, nama FROM users;
-- Harus ada minimal 2 admin
```

## 🔧 Troubleshooting

### Error: "column does not exist"

**Solusi:**
1. Jalankan `database/fix_hafiz_schema.sql`
2. Refresh halaman aplikasi (Ctrl+F5)
3. Coba lagi

### Error: "relation does not exist"

**Solusi:**
1. Jalankan `database/schema.sql` dari awal
2. Tunggu sampai selesai
3. Lanjut ke fix_hafiz_schema.sql

### Error: "permission denied"

**Solusi:**
1. Pastikan Anda login sebagai owner project
2. Cek di Settings > API > Project API keys
3. Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local` benar

### Upload Excel Gagal

**Solusi:**
1. Pastikan schema sudah benar (jalankan fix_hafiz_schema.sql)
2. Pastikan RLS policies sudah dibuat
3. Login sebagai admin (bukan hafiz)
4. Cek format Excel sesuai template

### Error RLS "infinite recursion"

**Solusi:**
Jalankan query ini untuk reset policies:

```sql
-- Drop semua policies hafiz
DROP POLICY IF EXISTS "Hafiz can view own data" ON public.hafiz;
DROP POLICY IF EXISTS "Admin kabko can view hafiz in their region" ON public.hafiz;
DROP POLICY IF EXISTS "Admin provinsi can view all hafiz" ON public.hafiz;
DROP POLICY IF EXISTS "Admin can insert hafiz" ON public.hafiz;
DROP POLICY IF EXISTS "Admin can update hafiz" ON public.hafiz;

-- Buat ulang (copy dari fix_hafiz_schema.sql bagian CREATE POLICY)
```

## 📊 Struktur Database

### Tabel Utama:
1. **users** - Data user (admin & hafiz)
2. **kabupaten_kota** - 38 Kab/Kota di Jatim
3. **periode_tes** - Periode tes per tahun
4. **hafiz** - Data lengkap huffadz
5. **laporan_harian** - Laporan harian hafiz
6. **kuota** - Kuota per wilayah
7. **penguji** - Data penguji
8. **jadwal_tes** - Jadwal tes
9. **absensi_tes** - Absensi peserta tes
10. **penugasan_penguji** - Penugasan penguji
11. **dokumen** - Dokumen terkait

### Views:
- **v_statistik_kabko** - Statistik per kabupaten/kota
- **v_laporan_summary** - Summary laporan harian

## ✅ Checklist Setup

- [ ] Jalankan `schema.sql`
- [ ] Jalankan `fix_hafiz_schema.sql`
- [ ] Jalankan `insert_admin_users.sql` (atau buat manual)
- [ ] Verifikasi kolom hafiz (harus ada 30+ kolom)
- [ ] Verifikasi kabupaten_kota (harus 38)
- [ ] Verifikasi periode_tes (harus 8 periode)
- [ ] Test login admin provinsi
- [ ] Test login admin kab/ko
- [ ] Test upload Excel
- [ ] Test mutasi hafiz

## 🆘 Bantuan

Jika masih ada masalah:
1. Screenshot error yang muncul
2. Copy query yang dijalankan
3. Cek console browser (F12) untuk error detail
4. Hubungi support

## 📝 Catatan Penting

- **JANGAN** hapus tabel yang sudah ada data
- **BACKUP** database sebelum menjalankan script besar
- **TEST** di environment development dulu
- **DOKUMENTASI** setiap perubahan yang dilakukan

---

Last updated: 2025-12-12
