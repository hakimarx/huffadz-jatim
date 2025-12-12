# Panduan Upload Excel Huffadz

## 📋 Format Excel yang Benar

### Header Kolom (Baris Pertama)

Pastikan header Excel Anda **PERSIS** seperti ini:

| No | Kolom | Wajib? | Format | Contoh |
|----|-------|--------|--------|--------|
| 1 | NIK | ✅ Ya | 16 digit angka | 3578012345670001 |
| 2 | NAMA | ✅ Ya | Teks | MUHAMMAD AHMAD |
| 3 | TEMPAT LAHIR | ✅ Ya | Teks | Surabaya |
| 4 | TANGGAL LAHIR | ✅ Ya | DD/MM/YYYY | 15/08/1995 |
| 5 | JK | ✅ Ya | L atau P | L |
| 6 | ALAMAT | ✅ Ya | Teks | Jl. Mawar No. 123 |
| 7 | RT | ⚪ Tidak | Angka 2-3 digit | 01 |
| 8 | RW | ⚪ Tidak | Angka 2-3 digit | 02 |
| 9 | DESA/KELURAHAN | ✅ Ya | Teks | Gubeng |
| 10 | KECAMATAN | ✅ Ya | Teks | Gubeng |
| 11 | DAERAH | ✅ Ya | Nama Kab/Kota | Kota Surabaya |
| 12 | TELEPON | ⚪ Tidak | Angka (08xxx) | 081234567890 |
| 13 | SERTIFIKAT TAHFIDZ | ⚪ Tidak | Teks | 30 Juz |
| 14 | MENGAJAR | ⚪ Tidak | Nama tempat atau kosong | Ponpes Al-Hikmah |
| 15 | TMT MENGAJAR | ⚪ Tidak | DD/MM/YYYY | 01/01/2020 |
| 16 | KETERANGAN | ⚪ Tidak | Teks | - |
| 17 | TAHUN SELEKSI | ✅ Ya | Tahun (YYYY) | 2024 |
| 18 | LULUS | ⚪ Tidak | LULUS/TIDAK/kosong | LULUS |

## 📝 Contoh Data

```
NIK              | NAMA              | TEMPAT LAHIR | TANGGAL LAHIR | JK | ALAMAT           | RT | RW | DESA/KELURAHAN | KECAMATAN | DAERAH        | TELEPON      | SERTIFIKAT TAHFIDZ | MENGAJAR        | TMT MENGAJAR | KETERANGAN | TAHUN SELEKSI | LULUS
3578012345670001 | MUHAMMAD AHMAD    | Surabaya     | 15/08/1995    | L  | Jl. Mawar No. 1  | 01 | 02 | Gubeng         | Gubeng    | Kota Surabaya | 081234567890 | 30 Juz             | Ponpes Al-Hikmah| 01/01/2020   | -          | 2024          | LULUS
3578012345670002 | FATIMAH ZAHRA     | Malang       | 20/03/1998    | P  | Jl. Melati No. 5 | 03 | 04 | Lowokwaru      | Lowokwaru | Kota Malang   | 081234567891 | 30 Juz             | -               | -            | -          | 2023          | LULUS
```

## ⚠️ Aturan Penting

### 1. Format Tanggal
- **HARUS** format Indonesia: `DD/MM/YYYY`
- Contoh BENAR: `15/08/1995`, `01/01/2020`
- Contoh SALAH: `1995-08-15`, `08/15/1995`

### 2. NIK (Nomor Induk Kependudukan)
- **HARUS** 16 digit angka
- Tidak boleh ada spasi, tanda hubung, atau karakter lain
- Harus unik (tidak boleh duplikat)
- Contoh: `3578012345670001`

### 3. Jenis Kelamin (JK)
- **HARUS** `L` (Laki-laki) atau `P` (Perempuan)
- Huruf besar atau kecil sama saja
- Tidak boleh `Laki-laki`, `Perempuan`, `M`, `F`, dll

### 4. Daerah (Kabupaten/Kota)
Harus salah satu dari 38 Kab/Kota di Jawa Timur:

**Kota:**
- Kota Surabaya
- Kota Malang
- Kota Kediri
- Kota Blitar
- Kota Mojokerto
- Kota Madiun
- Kota Pasuruan
- Kota Probolinggo
- Kota Batu

**Kabupaten:**
- Kabupaten Gresik
- Kabupaten Sidoarjo
- Kabupaten Mojokerto
- Kabupaten Jombang
- Kabupaten Bojonegoro
- Kabupaten Tuban
- Kabupaten Lamongan
- Kabupaten Madiun
- Kabupaten Magetan
- Kabupaten Ngawi
- Kabupaten Ponorogo
- Kabupaten Pacitan
- Kabupaten Kediri
- Kabupaten Nganjuk
- Kabupaten Blitar
- Kabupaten Tulungagung
- Kabupaten Trenggalek
- Kabupaten Malang
- Kabupaten Pasuruan
- Kabupaten Probolinggo
- Kabupaten Lumajang
- Kabupaten Jember
- Kabupaten Bondowoso
- Kabupaten Situbondo
- Kabupaten Banyuwangi
- Kabupaten Sampang
- Kabupaten Pamekasan
- Kabupaten Sumenep
- Kabupaten Bangkalan

### 5. Tahun Seleksi
- Harus tahun yang valid (2015-2024)
- Format: 4 digit angka
- Contoh: `2024`, `2023`

### 6. Status Lulus
- Kosongkan jika belum ada hasil
- Isi `LULUS` jika sudah lulus
- Isi `TIDAK` atau `TIDAK LULUS` jika tidak lulus
- Bisa juga isi tahun kelulusan (contoh: `2024`)

### 7. Mengajar
- Kosongkan jika tidak mengajar
- Isi nama tempat mengajar jika mengajar
- Contoh: `Ponpes Al-Hikmah`, `TPQ Nurul Huda`

## 🔧 Cara Download Template

1. Login ke aplikasi sebagai Admin
2. Klik menu **Data Hafiz**
3. Klik tombol **Template** (icon download)
4. File `Template_Import_Hafiz.xlsx` akan terdownload
5. Buka file, isi data sesuai format
6. Save dan upload kembali

## 📤 Cara Upload Excel

1. Login sebagai **Admin Provinsi** atau **Admin Kab/Ko**
2. Klik menu **Data Hafiz**
3. Klik tombol **Upload Excel**
4. Pilih file Excel yang sudah diisi
5. Tunggu proses upload (bisa 1-5 menit tergantung jumlah data)
6. Akan muncul notifikasi sukses/gagal

## ❌ Error yang Sering Terjadi

### Error: "Could not find the 'alamat' column"
**Penyebab:** Header kolom tidak sesuai
**Solusi:** 
- Pastikan header PERSIS seperti di tabel di atas
- Jangan ada spasi ekstra
- Jangan ubah nama kolom

### Error: "Invalid or missing NIK"
**Penyebab:** NIK tidak valid
**Solusi:**
- Pastikan NIK 16 digit
- Hapus spasi, tanda hubung, atau karakter lain
- Pastikan tidak ada NIK yang duplikat

### Error: "Infinite recursion detected"
**Penyebab:** Masalah RLS di database
**Solusi:**
- Jalankan script `fix_hafiz_schema.sql` di Supabase
- Lihat file `database/FIX_ERROR.md`

### Upload Lambat atau Timeout
**Penyebab:** Data terlalu banyak
**Solusi:**
- Pecah file Excel menjadi beberapa bagian (max 500 baris per file)
- Upload satu per satu
- Pastikan koneksi internet stabil

## ✅ Tips Upload Sukses

1. **Cek data dulu** - Pastikan semua kolom wajib terisi
2. **Hapus baris kosong** - Jangan ada baris kosong di tengah data
3. **Satu sheet** - Pastikan data di sheet pertama
4. **Format konsisten** - Jangan campur format tanggal
5. **Test dulu** - Upload 5-10 data dulu untuk test
6. **Backup** - Simpan file Excel asli sebelum upload

## 📊 Monitoring Upload

Saat upload, akan muncul log seperti ini:

```
⏳ Membaca file...
✅ Berhasil membaca 150 baris data.
⏳ Memproses 150 data valid...
Sending batch 1 / 3...
Sending batch 2 / 3...
Sending batch 3 / 3...
✅ Proses selesai!
```

Jika ada error, akan muncul:
```
❌ Batch 2 gagal: [pesan error]
```

## 🆘 Butuh Bantuan?

1. Baca file `database/FIX_ERROR.md` untuk solusi cepat
2. Baca file `database/SETUP.md` untuk panduan lengkap
3. Cek console browser (F12) untuk error detail
4. Screenshot error dan hubungi support

---

**PENTING**: Pastikan database sudah di-setup dengan benar sebelum upload!
Jalankan `fix_hafiz_schema.sql` di Supabase SQL Editor terlebih dahulu.
