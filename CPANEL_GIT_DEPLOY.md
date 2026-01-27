# 🚀 PANDUAN DEPLOYMENT DENGAN GIT AUTO-DEPLOY

**Tanggal Update**: 27 Januari 2026

Panduan ini menjelaskan cara setup agar perubahan di GitHub **otomatis ter-deploy** ke cPanel.

---

## 📋 INFORMASI SERVER

| Parameter | Value |
|-----------|-------|
| **Domain** | hafizjatim.my.id |
| **IP Server** | 159.69.183.150 |
| **cPanel URL** | http://159.69.183.150:2082/ |
| **Username cPanel** | hafizjat |
| **Password cPanel** | RIhzuC[5[21x4M |
| **GitHub Repo** | https://github.com/hakimarx/huffadz-jatim.git |

---

## 🔧 LANGKAH 1: LOGIN KE CPANEL

1. Buka browser
2. Akses: **http://159.69.183.150:2082/**
3. Login dengan:
   - Username: `hafizjat`
   - Password: `RIhzuC[5[21x4M`

---

## 🔧 LANGKAH 2: SETUP GIT VERSION CONTROL

### 2.1 Buka Git Version Control
1. Di cPanel dashboard, cari dan klik **"Git™ Version Control"**
2. Klik tombol **"Create"** untuk membuat repository baru

### 2.2 Clone Repository dari GitHub
1. Toggle **"Clone a Repository"** ke ON
2. Isi form:
   - **Clone URL**: `https://github.com/hakimarx/huffadz-jatim.git`
   - **Repository Path**: `/home/hafizjat/repositories/huffadz-jatim`
   - **Repository Name**: `huffadz-jatim`
3. Klik **"Create"**

### 2.3 Buat Deployment Script
1. Kembali ke cPanel dashboard
2. Buka **"File Manager"**
3. Navigasi ke `/home/hafizjat/repositories/huffadz-jatim`
4. Buat file baru bernama `.cpanel.yml` dengan isi:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/hafizjat/public_html
    - /bin/rm -rf $DEPLOYPATH/*
    - /bin/cp -R .next/standalone/* $DEPLOYPATH/
    - /bin/cp -R .next/static $DEPLOYPATH/.next/
    - /bin/cp -R public/* $DEPLOYPATH/public/
    - cd $DEPLOYPATH && /opt/cpanel/ea-nodejs18/bin/npm install --production
```

---

## 🔧 LANGKAH 3: BUAT DATABASE MYSQL

### 3.1 Buat Database
1. Di cPanel, klik **"MySQL® Databases"**
2. Di bagian **Create New Database**:
   - Ketik: `huffadz`
   - Klik **Create Database**
   - Database akan menjadi: `hafizjat_huffadz`

### 3.2 Buat User Database
1. Di bagian **Add New User**:
   - Username: `admin`
   - Password: `HuffadzDB@2026!` (CATAT PASSWORD INI!)
   - Klik **Create User**
   - User akan menjadi: `hafizjat_admin`

### 3.3 Hubungkan User ke Database
1. Di bagian **Add User To Database**:
   - Pilih User: `hafizjat_admin`
   - Pilih Database: `hafizjat_huffadz`
   - Klik **Add**
2. Centang **ALL PRIVILEGES**
3. Klik **Make Changes**

---

## 🔧 LANGKAH 4: IMPORT DATABASE

1. Di cPanel, klik **"phpMyAdmin"**
2. Di sidebar kiri, klik database **hafizjat_huffadz**
3. Klik tab **"Import"**
4. Klik **"Choose File"** dan upload file: `database/production_setup.sql`
5. Klik **"Go"**

---

## 🔧 LANGKAH 5: SETUP NODE.JS APP

### 5.1 Buka Setup Node.js App
1. Di cPanel, klik **"Setup Node.js App"**
2. Klik **"CREATE APPLICATION"**

### 5.2 Konfigurasi Aplikasi

| Setting | Value |
|---------|-------|
| **Node.js version** | 18.x atau 20.x |
| **Application mode** | Production |
| **Application root** | public_html |
| **Application URL** | hafizjatim.my.id |
| **Application startup file** | server.js |

3. Klik **"CREATE"**

### 5.3 Setup Environment Variables

Di bagian **Environment variables**, tambahkan satu per satu:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | production |
| `DATABASE_HOST` | localhost |
| `DATABASE_PORT` | 3306 |
| `DATABASE_USER` | hafizjat_admin |
| `DATABASE_PASSWORD` | HuffadzDB@2026! |
| `DATABASE_NAME` | hafizjat_huffadz |
| `DATABASE_SSL` | false |
| `SESSION_SECRET` | HuffadzJatim2026SecretKey!@#$%^&*() |
| `NEXT_PUBLIC_APP_URL` | https://hafizjatim.my.id |
| `PORT` | 3000 |

Klik **SAVE** setelah menambahkan semua variables.

---

## 🔧 LANGKAH 6: DEPLOY PERTAMA KALI

### 6.1 Build di PC Lokal
Jalankan di PC lokal:
```bash
cd c:\Users\Administrator\aplikasi\huffadz-jatim
npm run build
```

### 6.2 Upload Build Results
1. Compress folder `.next` menjadi `next-build.zip`
2. Compress folder `public` menjadi `public.zip`
3. Upload kedua file ke cPanel File Manager > public_html
4. Extract keduanya

### 6.3 Upload server.js dan package.json
Upload juga file:
- `.next/standalone/server.js` → ke `public_html/server.js`
- `.next/standalone/package.json` → ke `public_html/package.json`
- `.next/standalone/node_modules` → ke `public_html/node_modules`

### 6.4 Start Application
1. Kembali ke **Setup Node.js App**
2. Klik **START** atau **RESTART**

---

## 🔄 AUTO-UPDATE DARI GITHUB

### Cara Update Aplikasi setelah ada perubahan di GitHub:

1. Login ke cPanel
2. Buka **Git™ Version Control**
3. Klik **Manage** pada repository `huffadz-jatim`
4. Klik **Update from Remote** atau **Pull**

Atau via SSH/Terminal:
```bash
cd /home/hafizjat/repositories/huffadz-jatim
git pull origin master
```

### Setup Webhook (Otomatis)
Untuk deployment benar-benar otomatis, setup webhook:

1. Di GitHub repository, buka **Settings > Webhooks**
2. Klik **Add webhook**
3. Payload URL: `https://hafizjatim.my.id/api/deploy/webhook`
4. Content type: `application/json`
5. Secret: (kosongkan atau buat secret)
6. Events: **Just the push event**
7. Klik **Add webhook**

---

## 🧪 VERIFIKASI

### Test Website
1. Buka: https://hafizjatim.my.id
2. Seharusnya tampil halaman utama aplikasi

### Test Login
- Email: `admin@hafizjatim.my.id`
- Password: `Admin123!`

---

## 🔧 TROUBLESHOOTING

### Website menampilkan "Index of /"
- Pastikan file sudah di-extract ke public_html
- Pastikan Node.js App sudah started

### Error 503 Service Unavailable
- Check Node.js App status di cPanel
- Check error log di cPanel > Error Log

### Database Connection Error
- Verifikasi environment variables sudah benar
- Test koneksi database via phpMyAdmin

---

*Dokumentasi dibuat: 27 Januari 2026*
