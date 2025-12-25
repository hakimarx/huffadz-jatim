# Panduan Setup TiDB Cloud (Gratis)

## 🚀 Langkah 1: Buat Akun TiDB Cloud

1. Buka **https://tidbcloud.com/signup**
2. Daftar dengan **Google** atau **GitHub** (lebih cepat)
3. Verifikasi email jika diminta

---

## 🗄️ Langkah 2: Buat Cluster TiDB Serverless

1. Setelah login, klik **"Create Cluster"**
2. Pilih **"TiDB Serverless"** (gratis)
3. Cluster Name: `huffadz-jatim`
4. Cloud Provider: **AWS**
5. Region: **Singapore (ap-southeast-1)** ← paling dekat Indonesia
6. Klik **"Create"**
7. Tunggu 1-2 menit sampai cluster aktif

---

## 🔐 Langkah 3: Dapatkan Connection String

1. Klik cluster yang baru dibuat
2. Klik **"Connect"** di pojok kanan atas
3. Di bagian **"Connect With"**, pilih **"General"**
4. Di bagian **"Endpoint Type"**, pilih **"Public"**
5. Klik **"Generate Password"** → fiJrPakHUDPl7cki
6. Catat informasi berikut:
   - **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **User**: (username yang ditampilkan, biasanya `randomstring.root`)
   - **Password**: (yang baru di-generate)

---

## 📝 Langkah 4: Import Schema

1. Di halaman cluster, klik **"SQL Editor"**
2. Copy semua isi file `database/huffadz_jatim_mysql.sql`
3. Paste ke SQL Editor
4. Klik **"Run"**
5. Tunggu sampai semua tabel terbuat

---

## ⚙️ Langkah 5: Update .env.local

Edit file `.env.local` dengan nilai dari TiDB:

```env
DATABASE_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DATABASE_PORT=4000
DATABASE_USER=your_username.root
DATABASE_PASSWORD=your_password
DATABASE_NAME=huffadz_jatim
DATABASE_SSL=true
SESSION_SECRET=huffadz-jatim-super-secret-session-key-2024
```

---

## 🚀 Langkah 6: Deploy ke Vercel

1. Push ke GitHub
2. Di Vercel, connect repository
3. Add Environment Variables (sama seperti .env.local)
4. Deploy!

---

## ✅ Selesai!

Akses aplikasi di URL Vercel yang diberikan.
Login dengan: `admin.provinsi@lptq.jatimprov.go.id` / `admin123`
