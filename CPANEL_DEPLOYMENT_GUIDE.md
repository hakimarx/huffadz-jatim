# 📋 PANDUAN DEPLOYMENT HUFFADZ JATIM KE CPANEL

Domain: **hafizjatim.my.id**

---

## 🔧 LANGKAH 1: SETUP DATABASE DI CPANEL

### 1.1 Buat Database MySQL
1. Login ke **cPanel** hosting Anda
2. Klik **MySQL® Databases** atau **MySQL Wizard**
3. Buat database baru dengan nama: `huffadz` (akan menjadi `username_huffadz`)
4. Buat user database dengan nama: `admin` (akan menjadi `username_admin`)
5. Berikan password yang kuat untuk user database (simpan baik-baik!)
6. **Add User to Database** dan berikan **ALL PRIVILEGES**

**Catatan:** Di cPanel, format nama menjadi: `username_namadb`
- Contoh database: `hafizjat_huffadz`
- Contoh user: `hafizjat_admin`

### 1.2 Import SQL File
1. Klik **phpMyAdmin** di cPanel
2. Pilih database yang baru dibuat (`hafizjat_huffadz`)
3. Klik tab **Import** di bagian atas
4. Klik **Choose File** → pilih file `database/production_setup.sql`
5. Klik **Go** untuk menjalankan import
6. Pastikan semua tabel berhasil dibuat (13+ tabel)

---

## 🔐 LANGKAH 2: SETUP NODE.JS APPLICATION DI CPANEL

### 2.1 Buka Setup Node.js App
1. Di cPanel, cari dan klik **Setup Node.js App**
2. Klik **CREATE APPLICATION**

### 2.2 Konfigurasi Aplikasi
| Setting | Value |
|---------|-------|
| **Node.js version** | 18.x atau 20.x (pilih yang tersedia) |
| **Application mode** | Production |
| **Application root** | huffadz-jatim (atau nama folder di public_html) |
| **Application URL** | hafizjatim.my.id |
| **Application startup file** | server.js |

3. Klik **CREATE** untuk membuat aplikasi

### 2.3 Setup Environment Variables
Di halaman Node.js App, scroll ke **Environment variables** dan tambahkan:

| Variable | Value |
|----------|-------|
| `DATABASE_HOST` | localhost |
| `DATABASE_PORT` | 3306 |
| `DATABASE_USER` | hafizjat_admin (sesuaikan) |
| `DATABASE_PASSWORD` | (password database Anda) |
| `DATABASE_NAME` | hafizjat_huffadz (sesuaikan) |
| `DATABASE_SSL` | false |
| `SESSION_SECRET` | (string random 32+ karakter) |
| `NODE_ENV` | production |
| `NEXT_PUBLIC_APP_URL` | https://hafizjatim.my.id |
| `PORT` | 3000 |

---

## 📤 LANGKAH 3: UPLOAD FILE APLIKASI

### 3.1 Siapkan File untuk Upload
File yang perlu diupload ada di folder:
```
.next/standalone/huffadz-jatim/
```

Struktur yang harus diupload ke hosting:
```
public_html/huffadz-jatim/
├── .next/              (dari .next/standalone/huffadz-jatim/.next/)
├── node_modules/       (dari .next/standalone/huffadz-jatim/node_modules/)
├── public/             (dari .next/standalone/huffadz-jatim/public/)
│   └── static/         (PENTING: copy dari .next/static/ ke public/static/)
├── server.js           (dari .next/standalone/huffadz-jatim/server.js)
└── package.json        (dari .next/standalone/huffadz-jatim/package.json)
```

### 3.2 Upload via File Manager atau FTP
1. Compress folder standalone ke `.zip`
2. Upload ke cPanel via **File Manager** atau FTP
3. Extract di folder yang ditentukan (misalnya `huffadz-jatim`)

### 3.3 PENTING: Copy Static Files
Next.js memerlukan file static yang di-serve terpisah:
```
cp -r .next/static public/
```
Atau via File Manager, copy isi folder `.next/static/` ke `public/static/`

---

## ▶️ LANGKAH 4: JALANKAN APLIKASI

### 4.1 Start Aplikasi
1. Kembali ke **Setup Node.js App** di cPanel
2. Temukan aplikasi yang sudah dibuat
3. Klik **RUN NPM INSTALL** jika belum (opsional, standalone sudah include dependencies)
4. Klik **START** untuk menjalankan aplikasi

### 4.2 Verifikasi
1. Buka browser dan akses: `https://hafizjatim.my.id`
2. Coba login dengan:
   - **Email**: admin@hafizjatim.my.id
   - **Password**: Admin123!

---

## 🔍 TROUBLESHOOTING

### Error: Application is not running
- Periksa log error di cPanel > Setup Node.js App > Log
- Pastikan semua environment variables sudah diisi dengan benar
- Pastikan file `server.js` ada di folder root aplikasi

### Error: Database connection failed
- Pastikan nama database dan user sudah benar (format: `username_namadb`)
- Pastikan user database memiliki akses ke database
- Periksa firewall tidak memblokir koneksi ke MySQL

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

> ⚠️ **PENTING**: Segera ganti password default setelah login pertama!

---

## 📁 FILE YANG TIDAK BOLEH DIUPLOAD KE GITHUB

- `.env.local`
- `.env.production`
- File yang berisi password atau kredensial

---

*Dokumentasi dibuat: 21 Januari 2026*
*Huffadz Jatim - LPTQ Jawa Timur*
