# 🚨 PERBAIKAN ERROR DATABASE - BACA INI DULU!

## Error yang Anda Alami:

```
❌ column hafiz.jenis_kelamin does not exist
❌ Could not find the 'kabupaten_kota' column
❌ Tidak dapat upload file Excel
```

## ✅ SOLUSI CEPAT (5 Menit)

### Langkah 1: Buka Supabase Dashboard

1. Buka https://supabase.com
2. Login dan pilih project Anda
3. Klik **SQL Editor** di menu kiri

### Langkah 2: Jalankan Script Perbaikan

1. Klik **New Query**
2. Copy SELURUH isi file ini: `database/fix_hafiz_schema.sql`
3. Paste ke SQL Editor
4. Klik tombol **RUN** (hijau, pojok kanan bawah)
5. Tunggu 5-10 detik sampai selesai

### Langkah 3: Verifikasi

Jalankan query ini untuk cek:

```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'hafiz'
ORDER BY ordinal_position;
```

Harus muncul kolom-kolom ini:
- ✅ jenis_kelamin
- ✅ kabupaten_kota
- ✅ tempat_mengajar
- ✅ status_insentif
- ✅ keterangan

### Langkah 4: Refresh Aplikasi

1. Kembali ke aplikasi (http://localhost:3000)
2. Tekan **Ctrl + F5** (hard refresh)
3. Login sebagai admin
4. Coba upload Excel lagi

## 📂 File-File Penting

| File | Fungsi | Kapan Digunakan |
|------|--------|-----------------|
| `fix_hafiz_schema.sql` | **PERBAIKAN UTAMA** | Jalankan SEKARANG |
| `schema.sql` | Setup awal database | Jika database masih kosong |
| `insert_admin_users.sql` | Buat akun admin | Setelah schema OK |
| `SETUP.md` | Panduan lengkap | Baca jika masih error |

## 🔍 Cek Apakah Sudah Berhasil

### Test 1: Login Admin
- Buka http://localhost:3000/login
- Email: `hakimarx@gmail.com`
- Password: `g4yung4n`
- Harus bisa masuk ke dashboard

### Test 2: Upload Excel
- Klik menu "Data Hafiz"
- Klik "Upload Excel"
- Pilih file Excel
- Harus berhasil tanpa error

### Test 3: Mutasi
- Pilih salah satu hafiz
- Klik "Mutasi"
- Ubah status atau wilayah
- Harus berhasil tersimpan

## ❓ Masih Error?

### Jika masih error "column does not exist":

```sql
-- Jalankan ini di SQL Editor
DROP TABLE IF EXISTS public.hafiz CASCADE;

-- Lalu jalankan fix_hafiz_schema.sql lagi
```

### Jika error "permission denied":

```sql
-- Jalankan ini di SQL Editor
GRANT ALL ON public.hafiz TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Jika error "RLS infinite recursion":

```sql
-- Jalankan ini di SQL Editor
ALTER TABLE public.hafiz DISABLE ROW LEVEL SECURITY;

-- Tunggu 5 detik, lalu:
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;

-- Lalu jalankan fix_hafiz_schema.sql lagi
```

## 📞 Butuh Bantuan?

1. Screenshot error yang muncul
2. Buka browser console (F12)
3. Copy error message
4. Cek file `database/SETUP.md` untuk panduan lengkap

## ⚡ Quick Commands

```bash
# Restart dev server
# Tekan Ctrl+C di terminal, lalu:
npm run dev

# Clear cache browser
# Tekan Ctrl+Shift+Delete
# Pilih "Cached images and files"
# Klik "Clear data"
```

---

**INGAT**: Jalankan `fix_hafiz_schema.sql` di Supabase SQL Editor SEKARANG!
