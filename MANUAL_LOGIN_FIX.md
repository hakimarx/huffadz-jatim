# Panduan Memperbaiki Login & Membuat User Contoh

Masalah "tidak dapat login" biasanya terjadi karena user sudah ada di Authentication Supabase, tetapi belum terdaftar di tabel `public.users` aplikasi, sehingga aplikasi tidak tahu role (peran) user tersebut.

## 1. Perbaiki User `hakimarx@gmail.com`

1. Buka Dashboard Supabase project Anda.
2. Masuk ke menu **SQL Editor** (ikon terminal di sidebar kiri).
3. Buat query baru, lalu copy-paste dan jalankan perintah berikut:

```sql
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_provinsi', 'Hakim Admin', 'Provinsi Jawa Timur'
FROM auth.users
WHERE email = 'hakimarx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin_provinsi';
```

4. Coba login kembali di aplikasi.

---

## 2. Membuat Contoh User untuk 3 Role

Untuk mencoba semua fitur, Anda perlu membuat 3 user berbeda. Ikuti langkah ini:

### Langkah A: Buat User di Authentication
Masuk ke menu **Authentication -> Users -> Add User** di Supabase, dan buat 3 user berikut (password bebas, misal: `123456`):

1. **Admin Kab/Ko**: `admin.sby@demo.com`
2. **Hafiz**: `hafiz.bwi@demo.com`
   *(User `hakimarx@gmail.com` sudah Anda buat sebelumnya untuk Admin Provinsi)*

### Langkah B: Link User ke Database Aplikasi
Setelah user dibuat di langkah A, kembali ke **SQL Editor** dan jalankan script berikut untuk memberikan role yang sesuai:

```sql
-- Setup Admin Surabaya
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_kabko', 'Admin Surabaya', 'Kota Surabaya'
FROM auth.users
WHERE email = 'admin.sby@demo.com'
ON CONFLICT (id) DO NOTHING;

-- Setup Hafiz Banyuwangi
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'hafiz', 'Abdullah Hafiz', 'Kabupaten Banyuwangi'
FROM auth.users
WHERE email = 'hafiz.bwi@demo.com'
ON CONFLICT (id) DO NOTHING;

-- Setup Profil Hafiz (Wajib untuk role Hafiz)
INSERT INTO public.hafiz (user_id, nik, nama, tanggal_lahir, jenis_kelamin, kabupaten_kota, tahun_tes)
SELECT 
    id, 
    '3510000000000001', 
    'Abdullah Hafiz', 
    '2000-01-01', 
    'L', 
    'Kabupaten Banyuwangi', 
    2025
FROM auth.users
WHERE email = 'hafiz.bwi@demo.com'
ON CONFLICT (nik) DO NOTHING;
```

## Ringkasan Login

Setelah menjalankan langkah di atas, Anda bisa login dengan akun-akun berikut:

| Role | Email | Password |
|------|-------|----------|
| **Admin Provinsi** | `hakimarx@gmail.com` | *(Password Anda)* |
| **Admin Kab/Ko** | `admin.sby@demo.com` | `123456` (atau yg Anda buat) |
| **Hafiz** | `hafiz.bwi@demo.com` | `123456` (atau yg Anda buat) |
