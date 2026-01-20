# 🧪 Panduan Testing Aplikasi Huffadz Jatim

## 📋 Persiapan

### 1. Pastikan Aplikasi Berjalan
```bash
npm run dev
```
Aplikasi akan berjalan di: **http://localhost:3000**

### 2. Pastikan Demo Users Sudah Ada
Buka Supabase Dashboard dan cek apakah 3 user ini sudah ada:
- ✅ admin.provinsi@lptq.jatimprov.go.id
- ✅ admin.surabaya@lptq.jatimprov.go.id  
- ✅ hafiz@example.com

Jika belum ada, ikuti instruksi di file: `database/setup_demo_users.sql`

---

## 🔐 TEST 1: LOGIN SEBAGAI ADMIN PROVINSI

### Kredensial:
- **Email:** admin.provinsi@lptq.jatimprov.go.id
- **Password:** admin123

### Langkah Testing:

1. **Buka aplikasi** → http://localhost:3000
2. **Klik tombol "Masuk"**
3. **Login dengan kredensial Admin Provinsi**
4. **Cek Dashboard:**
   - [ ] Apakah ada statistik total Huffadz?
   - [ ] Apakah ada chart distribusi gender?
   - [ ] Apakah ada chart distribusi umur?
   - [ ] Apakah ada data kelulusan?

5. **Cek Menu Sidebar:**
   - [ ] Dashboard
   - [ ] Data Hafiz
   - [ ] Laporan Harian
   - [ ] Periode Tes (jika ada)
   - [ ] Kuota (jika ada)
   - [ ] Statistik
   - [ ] Pengaturan

6. **Test Menu "Data Hafiz":**
   - [ ] Klik menu "Data Hafiz"
   - [ ] Apakah muncul tabel data Huffadz?
   - [ ] Apakah ada tombol "Tambah Hafiz"?
   - [ ] Apakah ada tombol "Import Excel"?
   - [ ] Apakah ada filter Kabupaten/Kota?
   - [ ] Apakah ada search box?
   - [ ] Coba klik "Tambah Hafiz" → Apakah form muncul?
   - [ ] Isi form dengan data dummy:
     ```
     NIK: 3578010101990001
     Nama: Test Hafiz Admin Prov
     Tempat Lahir: Surabaya
     Tanggal Lahir: 01/01/1990
     Jenis Kelamin: Laki-laki
     Alamat: Jl. Test No. 1
     Kabupaten/Kota: Kota Surabaya
     Tahun Tes: 2024
     ```
   - [ ] Klik "Simpan" → Apakah berhasil?
   - [ ] Apakah data baru muncul di tabel?

7. **Test Menu "Laporan Harian":**
   - [ ] Klik menu "Laporan Harian"
   - [ ] Apakah muncul daftar laporan?
   - [ ] Apakah ada filter tanggal?
   - [ ] Apakah ada filter status verifikasi?
   - [ ] Jika ada laporan pending, coba approve/reject

8. **Test Import Excel:**
   - [ ] Klik "Import Excel"
   - [ ] Upload file Excel (gunakan template dari EXCEL_FORMAT.md)
   - [ ] Apakah proses import berhasil?
   - [ ] Apakah ada error message yang jelas jika gagal?

9. **Logout:**
   - [ ] Klik tombol Logout
   - [ ] Apakah redirect ke halaman login?

### ✅ Hasil Test Admin Provinsi:
- **Login:** ⏳
- **Dashboard:** ⏳
- **Data Hafiz:** ⏳
- **Laporan Harian:** ⏳
- **Import Excel:** ⏳
- **Logout:** ⏳

---

## 🏛️ TEST 2: LOGIN SEBAGAI ADMIN KAB/KO

### Kredensial:
- **Email:** admin.surabaya@lptq.jatimprov.go.id
- **Password:** admin123

### Langkah Testing:

1. **Login dengan kredensial Admin Kab/Ko**

2. **Cek Dashboard:**
   - [ ] Apakah statistik hanya menampilkan data Surabaya?
   - [ ] Apakah TIDAK bisa lihat data daerah lain?

3. **Test Menu "Data Hafiz":**
   - [ ] Apakah hanya muncul Huffadz dari Surabaya?
   - [ ] Coba tambah Hafiz baru untuk Surabaya:
     ```
     NIK: 3578020202900002
     Nama: Test Hafiz Surabaya
     Kabupaten/Kota: Kota Surabaya
     ```
   - [ ] Apakah berhasil?
   - [ ] Coba tambah Hafiz untuk daerah lain (misal Gresik)
   - [ ] Apakah DITOLAK? (seharusnya tidak bisa)

4. **Test RLS (Row Level Security):**
   - [ ] Buka browser console (F12)
   - [ ] Cek apakah ada error "permission denied"?
   - [ ] Pastikan Admin Kab/Ko HANYA bisa akses data wilayahnya

5. **Test Laporan Harian:**
   - [ ] Apakah hanya muncul laporan dari Huffadz Surabaya?
   - [ ] Coba approve/reject laporan
   - [ ] Apakah berhasil?

6. **Test Import Excel:**
   - [ ] Upload Excel dengan data Huffadz Surabaya
   - [ ] Apakah berhasil?
   - [ ] Upload Excel dengan data daerah lain
   - [ ] Apakah DITOLAK?

7. **Logout**

### ✅ Hasil Test Admin Kab/Ko:
- **Login:** ⏳
- **Dashboard (Surabaya only):** ⏳
- **Data Hafiz (RLS):** ⏳
- **Laporan Harian:** ⏳
- **Import Excel:** ⏳
- **Logout:** ⏳

---

## 👤 TEST 3: LOGIN SEBAGAI HAFIZ

### Kredensial:
- **Email:** hafiz@example.com
- **Password:** admin123

### Langkah Testing:

1. **Login dengan kredensial Hafiz**

2. **Cek Dashboard:**
   - [ ] Apakah muncul profil pribadi?
   - [ ] Apakah ada ringkasan laporan harian?
   - [ ] Apakah ada status verifikasi?

3. **Test Menu "Profil":**
   - [ ] Klik menu Profil
   - [ ] Apakah bisa edit data pribadi?
   - [ ] Coba update nomor telepon
   - [ ] Coba update alamat
   - [ ] Klik "Simpan" → Apakah berhasil?

4. **Test Menu "Laporan Harian":**
   - [ ] Klik menu "Laporan Harian"
   - [ ] Apakah muncul daftar laporan sendiri?
   - [ ] Klik "Tambah Laporan"
   - [ ] Isi form laporan:
     ```
     Tanggal: Hari ini
     Jenis Kegiatan: Mengajar
     Deskripsi: Mengajar tahfidz di Masjid Al-Ikhlas
     Lokasi: Surabaya
     Durasi: 120 menit
     ```
   - [ ] Upload foto kegiatan (opsional)
   - [ ] Klik "Simpan" → Apakah berhasil?
   - [ ] Apakah laporan muncul dengan status "Pending"?

5. **Test Buat Laporan Lain:**
   - [ ] Buat laporan "Murojah"
   - [ ] Buat laporan "Khataman"
   - [ ] Buat laporan "Lainnya"
   - [ ] Apakah semua berhasil?

6. **Test Edit Laporan:**
   - [ ] Pilih laporan yang masih "Pending"
   - [ ] Klik "Edit"
   - [ ] Ubah deskripsi
   - [ ] Klik "Simpan" → Apakah berhasil?

7. **Test Hapus Laporan:**
   - [ ] Pilih laporan "Pending"
   - [ ] Klik "Hapus"
   - [ ] Konfirmasi hapus
   - [ ] Apakah berhasil dihapus?

8. **Test Restrictions:**
   - [ ] Apakah TIDAK bisa lihat data Hafiz lain?
   - [ ] Apakah TIDAK bisa akses menu admin?
   - [ ] Apakah TIDAK bisa approve laporan sendiri?

9. **Logout**

### ✅ Hasil Test Hafiz:
- **Login:** ⏳
- **Dashboard:** ⏳
- **Profil:** ⏳
- **Laporan Harian (Create):** ⏳
- **Laporan Harian (Edit):** ⏳
- **Laporan Harian (Delete):** ⏳
- **Restrictions (RLS):** ⏳
- **Logout:** ⏳

---

## 🐛 CATATAN BUG & ISSUES

### Critical Bugs:
```
(Catat di sini jika ada bug critical yang menghalangi testing)
```

### Major Issues:
```
(Catat di sini jika ada issue major)
```

### Minor Issues:
```
(Catat di sini jika ada issue minor)
```

### UI/UX Improvements:
```
(Catat di sini jika ada saran perbaikan UI/UX)
```

---

## 📊 SUMMARY HASIL TESTING

| User Role | Login | Dashboard | Data Hafiz | Laporan | Import | Overall |
|-----------|-------|-----------|------------|---------|--------|---------|
| Admin Prov | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Admin Kab/Ko | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Hafiz | ⏳ | ⏳ | ⏳ | ⏳ | N/A | ⏳ |

**Legend:**
- ✅ = Berhasil / Passed
- ❌ = Gagal / Failed
- ⏳ = Belum di-test
- ⚠️ = Ada issue tapi masih bisa jalan

---

## 📝 NEXT STEPS

Setelah testing selesai:
1. [ ] Fix semua critical bugs
2. [ ] Fix major issues
3. [ ] Improve UI/UX
4. [ ] Add missing features
5. [ ] Re-test setelah fix
6. [ ] Deploy to production

---

**Tester:** _________________
**Tanggal:** _________________
**Signature:** _________________
