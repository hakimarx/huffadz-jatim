# Akun Admin - Huffadz Jawa Timur

## Akun yang Telah Dibuat

### 1. Admin Provinsi (Hakimarx)
- **Email**: hakimarx@gmail.com
- **Password**: g4yung4n
- **Role**: Admin Provinsi
- **Akses**: Seluruh data Huffadz di Jawa Timur

### 2. Admin Provinsi (LPTQ)
- **Email**: adminprov@lptqjatim.go.id
- **Password**: 123456
- **Role**: Admin Provinsi
- **Akses**: Seluruh data Huffadz di Jawa Timur

### 3. Admin Kabupaten/Kota Surabaya
- **Email**: adminsby@huffadz.jatim.go.id
- **Password**: 123456
- **Role**: Admin Kab/Ko
- **Wilayah**: Kota Surabaya
- **Akses**: Data Huffadz Kota Surabaya saja

### 4. Hafiz (Test Account)
- **Email**: hafiz@test.com
- **Password**: 123456
- **Role**: Hafiz
- **Akses**: Kelola profil dan riwayat mengajar sendiri

## Cara Login

1. Buka aplikasi di browser: `http://localhost:3000`
2. Klik tombol "Masuk" atau navigasi ke `/login`
3. Masukkan email dan password sesuai akun di atas
4. Klik "Masuk"
5. Anda akan diarahkan ke dashboard sesuai role

## Cara Menambahkan User Admin (TiDB/MySQL)

### Melalui Script (Recommended)

Jalankan script setup untuk menambahkan admin users:

```bash
node scripts/setup_admin_users.js
```

### Melalui SQL Query Manual

Koneksi ke database TiDB, lalu jalankan:

```sql
-- Generate bcrypt hash untuk password terlebih dahulu menggunakan node
-- Contoh: const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 12)

INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active)
VALUES (
  'newemail@example.com',
  '$2a$12$xxxxx', -- bcrypt hash dari password
  'admin_provinsi', -- atau 'admin_kabko' atau 'hafiz'
  'Nama Admin',
  NULL, -- atau nama kabupaten/kota jika admin_kabko
  1
);
```

### Role yang Tersedia

| Role | Deskripsi |
|------|-----------|
| `admin_provinsi` | Admin dengan akses seluruh provinsi |
| `admin_kabko` | Admin Kabupaten/Kota (harus set `kabupaten_kota`) |
| `hafiz` | User hafiz biasa |

## Troubleshooting

### Lupa Password
1. Koneksi ke database TiDB
2. Generate bcrypt hash baru untuk password:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('newpassword', 12);
   console.log(hash);
   ```
3. Update password di database:
   ```sql
   UPDATE users SET password = '$2a$12$...' WHERE email = 'user@example.com';
   ```

### User Tidak Bisa Login
1. Pastikan user ada di tabel `users`
2. Pastikan `password` sudah di-hash dengan bcrypt
3. Pastikan `role` sudah diset dengan benar
4. Pastikan `is_active = 1`

### Error "User not found"
- Pastikan email sudah terdaftar di tabel `users`
- Cek ejaan email (case-sensitive)

## Keamanan

⚠️ **PENTING**: 
- Ganti password default setelah login pertama kali
- Jangan share password ke orang lain
- Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf, angka, simbol)
- Password di-hash menggunakan bcrypt (12 rounds)

## Kontak Support

Jika mengalami masalah, hubungi:
- Email: support@lptq.jatimprov.go.id
- WhatsApp: 08xx-xxxx-xxxx
