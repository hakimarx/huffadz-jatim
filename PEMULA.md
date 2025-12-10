# 👋 Panduan untuk Pemula

Selamat datang! Jika Anda baru dalam dunia programming, panduan ini akan membantu Anda memahami dan menjalankan aplikasi ini step-by-step.

## 🤔 Apa itu Aplikasi Ini?

Aplikasi **Sistem Pendataan Huffadz Jawa Timur** adalah website untuk:
- 📝 Mendaftar dan mendata Huffadz (penghafal Al-Quran)
- 📊 Mengelola tes seleksi penerima insentif
- 📖 Melaporkan kegiatan harian Huffadz
- ✅ Verifikasi dan approval oleh admin

## 🛠️ Teknologi yang Digunakan

Jangan khawatir jika belum paham, Anda akan belajar sambil jalan!

### Frontend (Tampilan Website)
- **Next.js**: Framework untuk membuat website modern
- **React**: Library JavaScript untuk membuat UI
- **TypeScript**: JavaScript dengan type checking (lebih aman)
- **TailwindCSS**: Framework CSS untuk styling

### Backend (Database & Server)
- **Supabase**: Platform backend (database, authentication, storage)
- **PostgreSQL**: Database untuk menyimpan data

## 📚 Istilah-Istilah Penting

### Programming Terms:
- **Repository/Repo**: Folder project yang berisi semua code
- **Commit**: Menyimpan perubahan code
- **Push**: Upload code ke GitHub
- **Pull**: Download code terbaru dari GitHub
- **Branch**: Cabang development terpisah
- **Merge**: Menggabungkan branch

### File & Folder:
- **`app/`**: Folder halaman-halaman website
- **`components/`**: Komponen reusable (tombol, card, dll)
- **`lib/`**: Helper functions dan utilities
- **`database/`**: File SQL untuk database
- **`.env.local`**: File konfigurasi rahasia (jangan di-share!)
- **`package.json`**: Daftar dependencies (library yang dipakai)

### Commands:
- **`npm install`**: Install semua dependencies
- **`npm run dev`**: Jalankan development server
- **`npm run build`**: Build untuk production
- **`git add .`**: Tambahkan semua perubahan
- **`git commit -m "pesan"`**: Commit dengan pesan
- **`git push`**: Upload ke GitHub

## 🚀 Mulai dari Nol

### Step 1: Install Software yang Dibutuhkan

#### 1.1 Install Node.js
1. Kunjungi [nodejs.org](https://nodejs.org)
2. Download versi **LTS** (Long Term Support)
3. Install dengan double-click file installer
4. Ikuti wizard instalasi (Next, Next, Finish)
5. Verifikasi instalasi:
   ```bash
   node --version
   # Harus muncul: v18.x.x atau lebih tinggi
   
   npm --version
   # Harus muncul: 9.x.x atau lebih tinggi
   ```

#### 1.2 Install Git
1. Kunjungi [git-scm.com](https://git-scm.com)
2. Download Git untuk Windows
3. Install dengan setting default
4. Verifikasi:
   ```bash
   git --version
   # Harus muncul: git version 2.x.x
   ```

#### 1.3 Install Code Editor (VS Code)
1. Kunjungi [code.visualstudio.com](https://code.visualstudio.com)
2. Download dan install
3. Buka VS Code
4. Install extensions yang berguna:
   - **ES7+ React/Redux/React-Native snippets**
   - **Tailwind CSS IntelliSense**
   - **GitLens**
   - **Prettier - Code formatter**

### Step 2: Clone Project

```bash
# Buka Terminal/Command Prompt
# Pindah ke folder yang Anda inginkan
cd C:\Users\YourName\Documents

# Clone repository
git clone https://github.com/hakimarx/huffadz-jatim.git

# Masuk ke folder project
cd huffadz-jatim
```

### Step 3: Install Dependencies

```bash
# Install semua library yang dibutuhkan
npm install

# Tunggu sampai selesai (bisa 2-5 menit)
```

### Step 4: Setup Database

Ikuti panduan lengkap di `database/SETUP.md`

Ringkasan:
1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Jalankan SQL dari file `database/schema.sql`
4. Copy API credentials

### Step 5: Konfigurasi Environment

```bash
# Buat file .env.local
# Copy dari .env.local.example (jika ada) atau buat baru

# Isi dengan credentials Supabase Anda:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 6: Jalankan Development Server

```bash
# Start server
npm run dev

# Buka browser dan kunjungi:
# http://localhost:3000
```

🎉 **Selamat! Aplikasi sudah running!**

## 📖 Memahami Struktur Project

```
huffadz-jatim/
├── app/                      # Halaman-halaman website
│   ├── page.tsx             # Homepage (/)
│   ├── login/               # Halaman login
│   ├── dashboard/           # Dashboard setelah login
│   └── globals.css          # Global styles
├── components/              # Komponen reusable
│   ├── Sidebar.tsx          # Sidebar navigation
│   ├── StatsCard.tsx        # Card statistik
│   └── LoadingSpinner.tsx   # Loading indicator
├── lib/                     # Utilities
│   └── supabase.ts          # Konfigurasi Supabase
├── database/                # Database files
│   ├── schema.sql           # Database schema
│   └── SETUP.md             # Setup guide
├── public/                  # Static files (images, etc)
├── .env.local              # Environment variables (RAHASIA!)
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Dokumentasi utama
```

## 🎨 Cara Mengedit Aplikasi

### Mengubah Teks di Homepage

1. Buka file `app/page.tsx`
2. Cari teks yang ingin diubah
3. Edit teks tersebut
4. Save file (Ctrl+S)
5. Lihat perubahan di browser (auto-reload)

### Mengubah Warna/Style

1. Buka file `app/globals.css`
2. Cari CSS variable yang ingin diubah:
   ```css
   --primary-600: #16a34a;  /* Warna hijau utama */
   ```
3. Ubah nilai warna (gunakan color picker)
4. Save dan lihat perubahan

### Menambah Halaman Baru

1. Buat folder baru di `app/`, misal: `app/about/`
2. Buat file `page.tsx` di dalamnya
3. Copy template dari halaman lain
4. Edit sesuai kebutuhan
5. Halaman otomatis accessible di `/about`

## 🐛 Troubleshooting untuk Pemula

### Error: "command not found"
**Solusi**: Pastikan Node.js dan npm sudah terinstall dengan benar.

### Error: "Module not found"
**Solusi**: Jalankan `npm install` lagi.

### Error: "Port 3000 already in use"
**Solusi**: 
```bash
# Stop server yang running (Ctrl+C)
# Atau gunakan port lain:
npm run dev -- -p 3001
```

### Aplikasi tidak auto-reload
**Solusi**: Restart development server (Ctrl+C, lalu `npm run dev` lagi).

### Error saat push ke Git
**Solusi**: 
```bash
# Set git config dulu
git config user.name "Nama Anda"
git config user.email "email@example.com"
```

## 📝 Workflow Development

### 1. Sebelum Mulai Coding

```bash
# Pull perubahan terbaru
git pull origin main

# Buat branch baru untuk fitur
git checkout -b feature/nama-fitur
```

### 2. Saat Coding

- Edit file yang diperlukan
- Save file (Ctrl+S)
- Test di browser
- Ulangi sampai selesai

### 3. Setelah Selesai

```bash
# Lihat file yang berubah
git status

# Add semua perubahan
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: tambah halaman about"

# Push ke GitHub
git push origin feature/nama-fitur
```

### 4. Merge ke Main

1. Buka GitHub repository
2. Klik "Pull Request"
3. Review changes
4. Merge pull request
5. Delete branch (opsional)

## 🎓 Belajar Lebih Lanjut

### Untuk Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Tutorial](https://nextjs.org/learn)

### Untuk React:
- [React Documentation](https://react.dev)
- [React Tutorial](https://react.dev/learn)

### Untuk TypeScript:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Untuk Supabase:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase YouTube Channel](https://www.youtube.com/@Supabase)

### Video Tutorial (Bahasa Indonesia):
- Search di YouTube: "Next.js tutorial bahasa indonesia"
- Search: "React untuk pemula"
- Search: "Supabase tutorial indonesia"

## 💡 Tips untuk Pemula

1. **Jangan takut error**: Error adalah bagian dari belajar. Baca pesan error dengan teliti.

2. **Google is your friend**: Jika stuck, search error message di Google. Biasanya ada solusinya di StackOverflow.

3. **Start small**: Mulai dari perubahan kecil dulu. Jangan langsung bikin fitur besar.

4. **Backup code**: Selalu commit dan push ke GitHub. Jangan sampai kehilangan code.

5. **Baca dokumentasi**: Dokumentasi adalah sumber belajar terbaik.

6. **Practice**: Coding adalah skill yang butuh latihan. Semakin sering, semakin mahir.

7. **Join community**: Gabung grup/forum developer untuk bertanya dan belajar.

## 🤝 Butuh Bantuan?

Jika stuck atau ada pertanyaan:

1. **Baca error message** dengan teliti
2. **Search di Google** dengan keyword error
3. **Cek dokumentasi** di folder `database/` dan file README
4. **Tanya di forum**:
   - [Stack Overflow](https://stackoverflow.com)
   - [Reddit r/nextjs](https://reddit.com/r/nextjs)
   - [Supabase Discord](https://discord.supabase.com)

## ✅ Checklist Pemula

- [ ] Node.js installed
- [ ] Git installed
- [ ] VS Code installed
- [ ] Project cloned
- [ ] Dependencies installed
- [ ] Supabase account created
- [ ] Database setup completed
- [ ] .env.local configured
- [ ] Development server running
- [ ] Homepage terbuka di browser

**Selamat belajar dan happy coding! 🚀**

---

*"The only way to learn a new programming language is by writing programs in it." - Dennis Ritchie*
