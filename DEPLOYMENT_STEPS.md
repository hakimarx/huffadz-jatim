# 🚀 PANDUAN DEPLOYMENT KE CPANEL - hafizjatim.my.id

**Tanggal**: 22 Januari 2026
**Status**: Siap untuk Deployment

---

## 📋 INFORMASI SERVER

| Parameter | Value |
|-----------|-------|
| **Domain** | hafizjatim.my.id |
| **IP Server** | 159.69.183.150 |
| **cPanel URL** | http://159.69.183.150:2082/ |
| **Username cPanel** | hafizjat |
| **Password cPanel** | RIhzuC[5[21x4M |

---

## ✅ LANGKAH 1: LOGIN KE CPANEL

1. Buka browser
2. Akses: **http://159.69.183.150:2082/**
3. Masukkan:
   - Username: `hafizjat`
   - Password: `RIhzuC[5[21x4M`
4. Klik **Login**

---

## ✅ LANGKAH 2: BUAT DATABASE MYSQL

### 2.1 Buat Database
1. Di cPanel, cari dan klik **MySQL® Databases**
2. Di bagian **Create New Database**:
   - Ketik: `huffadz` (akan menjadi `hafizjat_huffadz`)
   - Klik **Create Database**

### 2.2 Buat User Database
1. Di bagian **MySQL Users > Add New User**:
   - Username: `admin` (akan menjadi `hafizjat_admin`)
   - Password: **Buat password kuat dan SIMPAN!**
   - Contoh: `HuffadzDB@2026!`
   - Klik **Create User**

### 2.3 Hubungkan User ke Database
1. Di bagian **Add User To Database**:
   - Pilih User: `hafizjat_admin`
   - Pilih Database: `hafizjat_huffadz`
   - Klik **Add**
2. Pada halaman privileges, centang **ALL PRIVILEGES**
3. Klik **Make Changes**

---

## ✅ LANGKAH 3: IMPORT SQL DATABASE

1. Di cPanel, klik **phpMyAdmin**
2. Di sidebar kiri, klik database **hafizjat_huffadz**
3. Klik tab **Import** di bagian atas
4. Klik **Choose File**
5. Upload file: `database/production_setup.sql`
   - Lokasi file di PC Anda: `c:\Users\Administrator\aplikasi\huffadz-jatim\database\production_setup.sql`
6. Klik **Go**
7. Tunggu hingga import selesai, pastikan muncul pesan sukses

### Verifikasi Tabel
Setelah import, seharusnya ada tabel-tabel berikut:
- users
- kabupaten_kota
- periode_tes
- kuota
- hafiz
- riwayat_mengajar
- laporan_harian
- penguji
- jadwal_tes
- absensi_tes
- penugasan_penguji
- dokumen
- mutasi_hafiz
- settings
- absensi

---

## ✅ LANGKAH 4: UPLOAD FILE APLIKASI

### 4.1 Upload via File Manager

1. Di cPanel, klik **File Manager**
2. Masuk ke folder **public_html**
3. Klik **Upload** di toolbar
4. Upload file: `huffadz-jatim-production.zip`
   - Lokasi file di PC Anda: `c:\Users\Administrator\aplikasi\huffadz-jatim\huffadz-jatim-production.zip`
5. Tunggu upload selesai

### 4.2 Extract File

1. Kembali ke File Manager > public_html
2. Klik kanan pada file `huffadz-jatim-production.zip`
3. Pilih **Extract**
4. Pilih lokasi extract: `/home/hafizjat/public_html/`
5. Klik **Extract File(s)**
6. Hapus file zip setelah extract selesai (opsional)

### 4.3 Verifikasi Struktur Folder

Setelah extract, struktur folder harus seperti ini:
```
public_html/
├── .next/
│   └── standalone/
│       ├── .next/
│       ├── node_modules/
│       ├── public/
│       ├── server.js
│       └── package.json
```

---

## ✅ LANGKAH 5: SETUP NODE.JS APP

### 5.1 Buka Setup Node.js 
1. Di cPanel, cari dan klik **Setup Node.js App**
2. Klik tombol **CREATE APPLICATION**

### 5.2 Konfigurasi Aplikasi

| Setting | Value |
|---------|-------|
| **Node.js version** | 18.x atau 20.x (pilih yang tersedia) |
| **Application mode** | Production |
| **Application root** | .next/standalone (atau lokasi folder hasil extract) |
| **Application URL** | hafizjatim.my.id |
| **Application startup file** | server.js |

3. Klik **CREATE**

### 5.3 Setup Environment Variables

Di halaman Node.js App, scroll ke **Environment variables** dan **TAMBAHKAN SATU PER SATU**:

| Variable | Value |
|----------|-------|
| `DATABASE_HOST` | localhost |
| `DATABASE_PORT` | 3306 |
| `DATABASE_USER` | hafizjat_admin |
| `DATABASE_PASSWORD` | (password database yang Anda buat di Langkah 2) |
| `DATABASE_NAME` | hafizjat_huffadz |
| `DATABASE_SSL` | false |
| `SESSION_SECRET` | HuffadzJatim2026SecretKey!@#$%^&*() |
| `NODE_ENV` | production |
| `NEXT_PUBLIC_APP_URL` | https://hafizjatim.my.id |
| `PORT` | 3000 |

Klik **SAVE** setelah menambahkan setiap variable.

---

## ✅ LANGKAH 6: COPY STATIC FILES

⚠️ **PENTING:** Next.js memerlukan static files yang di-serve terpisah.

### Via Terminal cPanel:
1. Di halaman Node.js App, klik **Run NPM Install** (jika tersedia)
2. Klik tombol **Enter to terminal** atau buka **Terminal** dari cPanel
3. Jalankan command berikut:
```bash
cd ~/public_html/.next/standalone
cp -r .next/static public/
```

### Via File Manager:
1. Masuk ke folder `.next/standalone/.next/`
2. Copy folder `static`
3. Paste ke folder `.next/standalone/public/`

---

## ✅ LANGKAH 7: JALANKAN APLIKASI

1. Kembali ke **Setup Node.js App**
2. Temukan aplikasi yang sudah dibuat
3. Klik tombol **START** atau **RESTART**
4. Tunggu status berubah menjadi **Running**

---

## ✅ LANGKAH 8: VERIFIKASI

### 8.1 Test Akses Website
1. Buka browser baru
2. Akses: **https://hafizjatim.my.id**
3. Website seharusnya tampil

### 8.2 Test Login
Login dengan kredensial default:
- **Email**: admin@hafizjatim.my.id
- **Password**: Admin123!

⚠️ **PENTING**: Segera ganti password default setelah login pertama!

---

## 🔧 TROUBLESHOOTING

### Error: Application is not running
- Periksa log error di cPanel > Setup Node.js App > Log
- Pastikan semua environment variables sudah diisi dengan benar
- Pastikan file `server.js` ada di folder root aplikasi

### Error: Database connection failed
- Pastikan nama database dan user sudah benar (format: `username_namadb`)
- Pastikan user database memiliki akses ke database
- Periksa apakah password database sudah benar

### Error: 404 Not Found
- Pastikan folder `public/static/` sudah berisi file dari `.next/static/`
- Pastikan `Application startup file` di Node.js App adalah `server.js`

### Error: Module not found
- Jalankan `npm install` di terminal cPanel
- Atau upload ulang folder `node_modules` dari standalone

---

## 📊 INFORMASI LOGIN DEFAULT

| Role | Email | Password |
|------|-------|----------|
| Admin Provinsi | admin@hafizjatim.my.id | Admin123! |

---

## 📁 FILES YANG DIBUTUHKAN

1. **SQL Database**: `database/production_setup.sql`
2. **Production Build**: `huffadz-jatim-production.zip`

Kedua file ini sudah tersedia di folder project Anda.

---

*Dokumentasi dibuat: 22 Januari 2026*
*Huffadz Jatim - LPTQ Jawa Timur*
