# Sistem Pendataan Huffadz Jawa Timur (Si-Huffadz)

![LPTQ Banner](https://img.shields.io/badge/LPTQ-Jawa_Timur-green?style=for-the-badge&logo=mosque)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

> **Platform Digital Terintegrasi LPTQ Provinsi Jawa Timur**
> *Pendataan, Seleksi, dan Pelaporan Insentif Huffadz*

![LPTQ Jatim Logo](/public/logo-lptq.png)

Platform digital terintegrasi resmi dari **LPTQ Provinsi Jawa Timur** untuk pendataan, seleksi, dan pelaporan kegiatan para Huffadz (Penghafal Al-Qur'an) penerima insentif Gubernur Jawa Timur.

## 🚀 Fitur Unggulan

*   **Pendataan Terpusat**: Database tunggal untuk ribuan Huffadz se-Jawa Timur.
*   **Verifikasi Berjenjang**: Validasi data dari tingkat Kabupaten/Kota hingga Provinsi.
*   **Seleksi Digital**: Pengelolaan tes hafalan dan wawasan kebangsaan.
*   **Monitoring Real-time**: Pelaporan kegiatan harian (mengajar & muroja'ah) via aplikasi.
*   **WhatsApp Gateway**: Notifikasi otomatis untuk jadwal tes dan pengumuman.
*   **OCR & QR Scan**: Otomatisasi pembacaan KTP dan verifikasi kehadiran.

## 🛠️ Teknologi Stack

Proyek ini dibangun menggunakan teknologi modern untuk performa, keamanan, dan skalabilitas:

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: MySQL (via `mysql2`)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Authentication**: Iron Session (Secure encrypted cookies) & Bcrypt
*   **Integration**: WhatsApp (Baileys), OCR (Tesseract.js)

## 📂 Struktur Project (Clean Architecture)

```
├── database/          # Skema database SQL dan migrasi
├── public/            # Aset statis (gambar, logo)
├── scripts/           # Script utilitas & maintenance (mis: fix_db, check_user)
├── src/
│   ├── app/           # Halaman Next.js (App Router)
│   ├── components/    # Komponen UI Reusable
│   ├── lib/           # Logic bisnis & Helper (DB connection, Auth)
│   ├── hooks/         # Custom React Hooks
│   ├── types/         # Definisi Tipe TypeScript
│   └── data/          # Data statis
└── .env               # Variabel lingkungan (RAHASIA)
```

## 🏁 Cara Menjalankan

### Prasyarat
*   Node.js (v18+)
*   MySQL Server

### Instalasi
1.  **Clone Repository**
    ```bash
    git clone https://github.com/hakimarx/huffadz-jatim.git
    cd huffadz-jatim
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database**
    *   Buat database MySQL baru (misal: `huffadz_db`).
    *   Import file `database/database.sql` ke database Anda.
    *   Konfigurasi koneksi di file `.env` (Lihat `.env.example`).

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000).

## 🔐 Keamanan

*   **Environment Variables**: Jangan pernah mengupload file `.env` ke repository publik. Gunakan `.env.example` sebagai referensi.
*   **Credential**: Pastikan data sensitif seperti password DB atau API Key tersimpan aman.

## 🤝 Kontribusi

Silakan buat *Pull Request* untuk perbaikan bug atau penambahan fitur. Pastikan kode mengikuti standar *style guide* yang ada.

## 📄 Lisensi

Hak Cipta © 2026 LPTQ Provinsi Jawa Timur. Private Repository. by hakimarx

## Deployment Status
Last updated: 2026-01-30 08.07


## Menjalankan WhatsApp Gateway Otomatis di cPanel
Untuk menjalankan WhatsApp Gateway secara otomatis di cPanel tanpa membuka terminal, Anda perlu mengatur **Cron Job**:

1. Login ke cPanel.
2. Buka menu **Cron Jobs**.
3. Pilih waktu **Once Per Minute** (* * * * *).
4. Masukkan perintah berikut:
   cd /home/huffadzj/public_html/scripts && /opt/cpanel/ea-nodejs20/bin/node wa-server.js > /dev/null 2>&1
   *(Ganti huffadzj dengan username cPanel Anda dan cek lokasi bin node di server Anda)*

> **Catatan:** Cara ini mungkin akan me-restart server setiap menit jika mati. Untuk solusi lebih permanen, disarankan menggunakan fitur **Node.js Selector** atau **PM2** jika tersedia akses SSH.
