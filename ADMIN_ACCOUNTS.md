# Akun Admin - Huffadz Jawa Timur

## Akun yang Telah Dibuat

### 1. Admin Provinsi
- **Email**: hakimarx@gmail.com
- **Password**: g4yung4n
- **Role**: Admin Provinsi
- **Akses**: Seluruh data Huffadz di Jawa Timur

### 2. Admin Kabupaten/Kota Surabaya
- **Email**: adminsby@huffadz.jatim.go.id
- **Password**: 123456
- **Role**: Admin Kab/Ko
- **Wilayah**: Kota Surabaya
- **Akses**: Data Huffadz Kota Surabaya saja

## Cara Login

1. Buka aplikasi di browser: `http://localhost:3000`
2. Klik tombol "Masuk" atau navigasi ke `/login`
3. Masukkan email dan password sesuai akun di atas
4. Klik "Masuk"
5. Anda akan diarahkan ke dashboard sesuai role

## Cara Menambahkan User Admin di Supabase

### Melalui Supabase Dashboard (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com
   - Pilih project Anda

2. **Buat User di Authentication**
   - Klik menu "Authentication" > "Users"
   - Klik tombol "Add User"
   - Isi:
     - Email: email admin baru
     - Password: password admin baru
   - Klik "Create User"
   - **Catat UUID** yang muncul (contoh: `550e8400-e29b-41d4-a716-446655440000`)

3. **Tambahkan ke Tabel `users`**
   - Klik menu "Table Editor" > pilih tabel `users`
   - Klik "Insert" > "Insert row"
   - Isi:
     - `id`: UUID dari step 2
     - `email`: email yang sama dengan step 2
     - `nama`: Nama lengkap admin
     - `role`: pilih `admin_provinsi` atau `admin_kabko`
     - `kabupaten_kota_id`: (jika admin_kabko) pilih ID kabupaten/kota
   - Klik "Save"

### Melalui SQL Editor

Jalankan script yang sudah disediakan di:
```
database/insert_admin_users.sql
```

Atau gunakan query manual:

```sql
-- 1. Insert ke auth.users (gunakan Supabase Dashboard lebih mudah)
-- Atau gunakan Supabase Auth API

-- 2. Insert ke public.users
INSERT INTO public.users (id, email, nama, role, kabupaten_kota_id)
VALUES (
  'UUID-DARI-AUTH-USERS',
  'email@example.com',
  'Nama Admin',
  'admin_provinsi', -- atau 'admin_kabko'
  NULL -- atau ID kabupaten/kota jika admin_kabko
);
```

## Troubleshooting

### Lupa Password
1. Buka Supabase Dashboard
2. Authentication > Users
3. Cari user berdasarkan email
4. Klik "..." > "Reset Password"
5. Kirim email reset atau set password baru langsung

### User Tidak Bisa Login
1. Pastikan user ada di tabel `auth.users`
2. Pastikan user ada di tabel `public.users` dengan `id` yang sama
3. Pastikan `role` sudah diset dengan benar
4. Cek apakah email sudah diverifikasi (di Supabase Dashboard)

### Error "User not found"
- Pastikan user sudah dibuat di kedua tabel (`auth.users` dan `public.users`)
- Pastikan `id` di kedua tabel sama persis (UUID)

## Keamanan

⚠️ **PENTING**: 
- Ganti password default setelah login pertama kali
- Jangan share password ke orang lain
- Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf, angka, simbol)
- Untuk production, aktifkan 2FA (Two-Factor Authentication) di Supabase

## Kontak Support

Jika mengalami masalah, hubungi:
- Email: support@lptq.jatimprov.go.id
- WhatsApp: 08xx-xxxx-xxxx
