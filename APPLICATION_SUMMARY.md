# Rangkuman Logika, Pola, dan Skema Aplikasi Huffadz Jatim

Dokumen ini memberikan ikhtisar teknis aplikasi Huffadz Jatim untuk memudahkan integrasi ke dalam aplikasi web lain.

## 1. Arsitektur Teknologi
*   **Frontend**: Next.js (App Router) - Memberikan performa tinggi dan SEO friendly.
*   **Database & Auth**: Supabase (PostgreSQL) - Menangani otentikasi, basis data real-time, dan penyimpanan file.
*   **Styling**: Tailwind CSS & Lucide React - Untuk UI yang responsif dan modern.
*   **Deployment**: Mendukung platform seperti Vercel atau Netlify.

## 2. Skema Data (Database Schema)
Aplikasi menggunakan PostgreSQL di Supabase dengan beberapa tabel utama:

### Tabel Inti
*   **`users`**: Ekstensi dari `auth.users` Supabase. Menyimpan file profil dan peran pengguna.
    *   Role: `admin_provinsi`, `admin_kabko`, `hafiz`.
*   **`hafiz`**: Data lengkap penghafal Al-Qur'an.
    *   Kolom Utama: `nik`, `nama`, `kabupaten_kota`, `status_insentif`, `status_kelulusan`.
*   **`laporan_harian`**: Log aktivitas harian hafiz (muroja'ah, mengajar, dll).
*   **`periode_tes`**: Manajemen waktu seleksi/pendaftaran.
*   **`kuota`**: Batasan jumlah pendaftar per kabupaten/kota.

### Tabel Penunjang
*   **`kabupaten_kota`**: Daftar wilayah di Jawa Timur.
*   **`penguji` & `jadwal_tes`**: Digunakan untuk manajemen operasional tes seleksi.
*   **`dokumen`**: Metadata untuk file yang diunggah (SPJ, Piagam, dll).

## 3. Logika Bisnis (Business Logic)
*   **Manajemen Peran (Role-Based Access Control)**:
    *   **Admin Provinsi**: Akses penuh ke seluruh data Jawa Timur, manajemen kuota, dan pengaturan sistem.
    *   **Admin Kab/Ko**: Mengelola data hafiz dan memverifikasi laporan di wilayah masing-masing.
    *   **Hafiz**: Mengisi data profil, mengunggah sertifikat, dan melaporkan kegiatan harian.
*   **Sistem Insentif**: Status kelayakan hafiz mendapatkan insentif diatur melalui kolom `status_insentif` berdasarkan hasil tes (`status_kelulusan`) dan keaktifan laporan.
*   **Verifikasi Laporan**: Laporan harian yang dikirim hafiz harus disetujui oleh admin wilayah agar dianggap valid.
*   **Mutasi**: Logika perpindahan data hafiz antar wilayah (kabupaten/kota).

## 4. Pola Pengembangan (Design Patterns)
*   **Row Level Security (RLS)**: Keamanan data di tingkat database. Database menjamin pengguna hanya bisa melihat data yang menjadi haknya (misal: Admin Surabaya hanya bisa melihat data Surabaya).
*   **Security Definer Functions**: Penggunaan fungsi PL/pgSQL untuk validasi role yang kompleks di tingkat database.
*   **Modular Dashboard**: Antarmuka yang berubah dinamis sesuai dengan role pengguna yang login.
*   **Server Actions & Hooks**: Menggunakan pola Next.js modern untuk interaksi data antara frontend dan backend.

## 5. Integrasi ke Aplikasi Lain
Jika Anda ingin memasukkan logika ini ke aplikasi lain:
1.  **Database**: Jalankan file `database/consolidated_schema.sql` (hasil gabungan) di instance PostgreSQL/Supabase baru.
2.  **Environment Variables**: Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` terkonfigurasi.
3.  **Components**: Sidebar (`components/Sidebar.tsx`) dan Dashboard Layout adalah komponen utama yang menentukan alur navigasi.
4.  **Storage**: Konfigurasi bucket di Supabase Storage untuk folder `hafiz_photos`, `ktp_photos`, dan `dokumen`.

---
*Catatan: File SQL gabungan dapat ditemukan di `database/consolidated_schema.sql`.*
