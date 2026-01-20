# Manual Tautkan Profil Hafiz ke Akun

Panduan singkat untuk admin menautkan profil `hafiz` ke akun user yang tepat.

## Pilihan cepat (SQL)
Jalankan perintah ini di database (uji di dev/staging terlebih dahulu):

```sql
-- Tautkan hafiz dengan email yang sama
UPDATE hafiz
SET user_id = (
  SELECT id FROM users WHERE email = 'user@example.com' LIMIT 1
)
WHERE email = 'user@example.com' AND (user_id IS NULL OR user_id = 0);

-- Tautkan hafiz berdasarkan NIK dan user email
UPDATE hafiz h
JOIN users u ON u.email = 'user@example.com'
SET h.user_id = u.id
WHERE h.nik = '123456789' AND (h.user_id IS NULL OR h.user_id = 0);
```

> Selalu backup database sebelum menjalankan perubahan langsung ke produksi.

## UI (di aplikasi)
- Buka menu **Data Hafiz** (`/dashboard/hafiz`) sebagai Admin Provinsi atau Admin Kab/Kota.
- Di kolom `Aksi` klik ikon **Tautkan Akun** pada baris yang belum terhubung.
- Cari user (email atau nama) lalu klik **Tautkan**.
- Sistem akan memvalidasi role user harus `hafiz` dan melakukan penautan.

## Catatan Keamanan
- Hanya Admin Provinsi / Admin Kab/Kota yang bisa menautkan.
- Admin Kab/Kota hanya boleh menautkan hafiz dalam wilayah mereka.
- Sistem tidak akan menimpa `user_id` yang sudah terisi oleh akun lain (untuk menghindari konflik).