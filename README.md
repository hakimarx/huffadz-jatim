# 📖 Sistem Pendataan Huffadz Jawa Timur

Aplikasi web untuk pendataan, seleksi, dan pelaporan kegiatan Huffadz penerima insentif 
## 🎯 Tentang Aplikasi

Sistem ini memfasilitasi:

- ✅ Pendataan Huffadz
- ✅ Manajemen Tes Seleksi (Tahfidz & Wawasan Kebangsaan)
- ✅ Sistem Kuota per Kab/Ko (max 1000/tahun)
- ✅ Laporan Harian Kegiatan
- ✅ Verifikasi Multi-Level
- ✅ Statistik & Reporting

## 🚀 Teknologi

- **Frontend**: Next.js 16 + React + TypeScript
- **Backend**: TiDB Cloud Serverless (MySQL-compatible)
- **Styling**: TailwindCSS + Custom CSS
- **Icons**: React Icons
- **Deployment**: Vercel / Custom Server

## 📋 Fitur Utama

### 1. **Admin Provinsi**
- Kelola semua data Huffadz se-Jawa Timur
- Atur periode tes dan kuota per daerah
- Verifikasi dan approve data
- Export laporan SPJ
- Manajemen penguji dan jadwal tes
- Dashboard statistik lengkap

### 2. **Admin Kabupaten/Kota**
- Input data Huffadz dari wilayahnya
- Verifikasi laporan harian Huffadz
- Lihat kuota dan statistik daerah
- Upload dokumen pendukung
- Kelola absensi tes

### 3. **Hafiz**
- Registrasi dengan upload KTP
- Update profil dan data pribadi
- Input laporan harian kegiatan:
  - Mengajar
  - Muroja'ah
  - Khataman
  - Kegiatan lainnya
- Upload foto kegiatan
- Lihat status verifikasi
- Download piagam kelulusan

## 🛠️ Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau yarn
- Akun TiDB Cloud (gratis di [tidbcloud.com](https://tidbcloud.com))

### Langkah Instalasi

1. **Clone repository**
```bash
git clone https://github.com/hakimarx/huffadz-jatim.git
cd huffadz-jatim
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup TiDB Cloud**
   - Buat akun di [tidbcloud.com](https://tidbcloud.com)
   - Buat cluster baru (pilih "TiDB Serverless" - GRATIS)
   - Region: **Singapore (ap-southeast-1)** untuk latency terbaik
   - Setelah cluster aktif, klik **Connect** > **General**
   - Generate password dan catat credential

4. **Import Database Schema**
   - Buka **SQL Editor** di TiDB Console
   - Copy dan jalankan file `database/huffadz_jatim_mysql.sql`

5. **Konfigurasi Environment**
   - Rename `.env.mysql.example` ke `.env.local` dan isi:
```env
DATABASE_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DATABASE_PORT=4000
DATABASE_USER=your_username.root
DATABASE_PASSWORD=your_password
DATABASE_NAME=huffadz_jatim
DATABASE_SSL=true
SESSION_SECRET=your-secret-key-here
```

6. **Jalankan Development Server**
```bash
npm run dev
```

7. **Buka browser**
```
http://localhost:3000
```

## 📊 Database Schema

Database terdiri dari 12 tabel utama:

**Row Level Security (RLS)** diaktifkan untuk keamanan data.

## 👥 Role & Permissions

### Admin Provinsi
- Full access ke semua data
- CRUD periode tes, kuota, penguji
- Verifikasi final
- Export laporan

### Admin Kab/Ko
- Access data Huffadz di wilayahnya
- Input & edit data Huffadz daerah
- Verifikasi laporan harian
- Lihat statistik daerah

### Hafiz
- View & edit profil sendiri
- Input laporan harian
- Upload foto kegiatan
- Lihat status verifikasi

## 🔐 Demo Accounts

Untuk testing, gunakan akun berikut:

**Admin Provinsi:**
- Email: `admin.provinsi

**Admin Kab/Ko (Surabaya):**
- Email: `admin.surabaya@lptq.jatimprov.go.id`


**Hafiz:**
- Email: `hafiz@example.com`


## 📱 Responsive Design

Aplikasi fully responsive untuk:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🎨 Design System

- **Color Palette**: Islamic Green & Gold
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, Gradients, Smooth Animations
- **Components**: Reusable & Modular

## 📦 Deployment

### Deploy ke Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables
4. Deploy!

### Deploy ke Server Custom

1. Build production:
```bash
npm run build
```

2. Start server:
```bash
npm start
```

## 🔄 Workflow Git

```bash
# Development
git checkout -b feature/nama-fitur
git add .
git commit -m "feat: deskripsi fitur"
git push origin feature/nama-fitur

# Merge ke main
git checkout main
git merge feature/nama-fitur
git push origin main
```

## 📈 Roadmap

- [x] Landing Page
- [x] Authentication System
- [x] Dashboard (3 roles)
- [x] Laporan Harian
- [ ] Data Hafiz Management
- [ ] Periode Tes & Kuota
- [ ] Jadwal & Absensi Tes
- [ ] Upload & OCR KTP
- [ ] Export Excel/PDF
- [ ] Email Notifications
- [ ] Mobile App (React Native)

## 🤝 Kontribusi

Untuk pemula yang ingin berkontribusi:

1. Fork repository
2. Buat branch baru
3. Commit changes
4. Push ke branch
5. Create Pull Request

## 📞 Kontak

**LPTQ Provinsi Jawa Timur**
- Website: [lptq.jatimprov.go.id](https://lptq.jatimprov.go.id)
- Email: info@lptq.jatimprov.go.id

## 📄 Lisensi

© 2026 LPTQ Provinsi Jawa Timur. All rights reserved.

---

**Dibuat dengan ❤️ untuk Huffadz Jawa Timur**
