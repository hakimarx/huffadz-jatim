# 🚀 Roadmap Pengembangan Aplikasi Huffadz Jatim

**Versi**: 3.0.0  
**Tanggal**: 13 Desember 2024  
**Status**: In Progress

---

## 📋 Overview

Roadmap ini mencakup pengembangan fitur-fitur lanjutan untuk Sistem Pendataan Huffadz Jawa Timur, meliputi manajemen data, notifikasi, export, dan mobile app.

---

## ✅ Fitur yang Sudah Selesai (v2.0.0)

- [x] **Autentikasi & Authorization**
  - Login dengan Supabase Auth
  - Role-based access control (Admin Provinsi, Admin Kab/Ko, Hafiz)
  - Row Level Security (RLS)

- [x] **Dashboard**
  - Dashboard Admin Provinsi dengan statistik real-time
  - Dashboard Admin Kab/Ko dengan filter wilayah
  - Dashboard Hafiz dengan profil dan pencapaian

- [x] **Data Hafiz Basic**
  - List data hafiz dengan pagination
  - Search dan filter
  - Import Excel dengan NIK parser yang robust

- [x] **Al-Quran Digital**
  - 114 surah lengkap
  - Terjemahan Indonesia
  - Audio murattal
  - Search surah

- [x] **Laporan Harian**
  - Form input laporan
  - Upload foto kegiatan
  - Verifikasi oleh admin

---

## 🎯 Fitur yang Akan Dikembangkan

### **FASE 1: Data Management Enhancement** 📊
**Target**: Minggu 1-2 (14-27 Desember 2024)  
**Priority**: HIGH

#### 1.1 Data Hafiz Management (Advanced)
- [ ] **CRUD Lengkap**
  - ✅ Read (sudah ada)
  - [ ] Create (manual input)
  - [ ] Update (edit data)
  - [ ] Delete (soft delete dengan keterangan)
  
- [ ] **Bulk Operations**
  - [ ] Bulk update status
  - [ ] Bulk export selected
  - [ ] Bulk mutasi wilayah
  
- [ ] **Data Validation**
  - [ ] Validasi NIK (16 digit, unique)
  - [ ] Validasi tanggal lahir (umur minimal/maksimal)
  - [ ] Validasi telepon (format Indonesia)
  - [ ] Validasi email
  
- [ ] **History & Audit Log**
  - [ ] Track semua perubahan data
  - [ ] Siapa yang mengubah, kapan, apa yang diubah
  - [ ] Restore data dari history

**Files to Create/Modify:**
```
app/dashboard/hafiz/
├── [id]/
│   ├── page.tsx          # Detail hafiz
│   └── edit/page.tsx     # Edit hafiz
├── create/page.tsx       # Create hafiz baru
└── components/
    ├── HafizForm.tsx     # Reusable form
    ├── BulkActions.tsx   # Bulk operations
    └── HistoryLog.tsx    # Audit log viewer
```

---

#### 1.2 Periode Tes & Kuota Management
- [ ] **Periode Tes CRUD**
  - [ ] Create periode tes baru
  - [ ] Update periode (tanggal, status, kuota)
  - [ ] Delete periode
  - [ ] Activate/Deactivate periode
  
- [ ] **Kuota Management**
  - [ ] Set kuota per kabupaten/kota
  - [ ] Monitor kuota terpakai vs tersedia
  - [ ] Alert jika kuota hampir penuh
  - [ ] Redistribute kuota
  
- [ ] **Pendaftaran Periode**
  - [ ] Form pendaftaran hafiz ke periode
  - [ ] Validasi kuota
  - [ ] Approval workflow
  - [ ] Waitlist jika kuota penuh

**Files to Create:**
```
app/dashboard/periode-tes/
├── page.tsx                    # List periode
├── [id]/page.tsx              # Detail periode
├── [id]/edit/page.tsx         # Edit periode
├── create/page.tsx            # Create periode
├── [id]/kuota/page.tsx        # Manage kuota
└── [id]/pendaftaran/page.tsx  # Pendaftaran hafiz
```

**Database Tables:**
```sql
-- Sudah ada di schema.sql:
- periode_tes
- kuota

-- Perlu ditambahkan:
- pendaftaran_periode (hafiz_id, periode_id, status, tanggal_daftar)
```

---

#### 1.3 Jadwal & Absensi Tes
- [ ] **Jadwal Tes Management**
  - [ ] Create jadwal tes per wilayah
  - [ ] Assign penguji ke jadwal
  - [ ] Set lokasi, waktu, kapasitas
  - [ ] Notifikasi ke hafiz yang terdaftar
  
- [ ] **Absensi Digital**
  - [ ] QR Code untuk absensi
  - [ ] Scan QR via mobile
  - [ ] Manual check-in oleh admin
  - [ ] Laporan kehadiran real-time
  
- [ ] **Penilaian Tes**
  - [ ] Form input nilai (tahfidz, wawasan)
  - [ ] Validasi nilai (0-100)
  - [ ] Auto-calculate status kelulusan
  - [ ] Generate nomor piagam

**Files to Create:**
```
app/dashboard/jadwal-tes/
├── page.tsx                # List jadwal
├── [id]/page.tsx          # Detail jadwal
├── [id]/absensi/page.tsx  # Absensi
├── [id]/penilaian/page.tsx # Input nilai
└── components/
    ├── QRCodeGenerator.tsx
    ├── QRScanner.tsx
    └── NilaiForm.tsx

app/api/
├── jadwal/route.ts
├── absensi/route.ts
└── qr-code/route.ts
```

**Dependencies:**
```json
{
  "qrcode": "^1.5.3",
  "html5-qrcode": "^2.3.8"
}
```

---

### **FASE 2: Upload & OCR Features** 📸
**Target**: Minggu 3 (28 Des - 3 Jan 2025)  
**Priority**: MEDIUM

#### 2.1 Upload & OCR KTP
- [ ] **Upload KTP**
  - [ ] Drag & drop upload
  - [ ] Image preview
  - [ ] Compress image sebelum upload
  - [ ] Upload ke Supabase Storage
  
- [ ] **OCR Integration**
  - [ ] Extract NIK dari KTP
  - [ ] Extract nama, tempat/tanggal lahir
  - [ ] Extract alamat lengkap
  - [ ] Auto-fill form dengan hasil OCR
  
- [ ] **Validation**
  - [ ] Verify NIK format
  - [ ] Cross-check dengan data existing
  - [ ] Manual correction jika OCR salah

**OCR Options:**
1. **Tesseract.js** (Free, Client-side)
2. **Google Cloud Vision API** (Paid, Accurate)
3. **Azure Computer Vision** (Paid, Accurate)

**Recommended**: Start with Tesseract.js, upgrade to Cloud API if needed

**Files to Create:**
```
app/dashboard/hafiz/create/
└── components/
    ├── KTPUploader.tsx
    ├── OCRProcessor.tsx
    └── OCRResults.tsx

lib/
└── ocr/
    ├── tesseract.ts
    └── parser.ts
```

**Dependencies:**
```json
{
  "tesseract.js": "^5.0.4",
  "react-dropzone": "^14.2.3",
  "browser-image-compression": "^2.0.2"
}
```

---

### **FASE 3: Export & Reporting** 📄
**Target**: Minggu 4 (4-10 Jan 2025)  
**Priority**: HIGH

#### 3.1 Export Excel
- [ ] **Export Data Hafiz**
  - [ ] Export all dengan filter
  - [ ] Export selected rows
  - [ ] Custom column selection
  - [ ] Multiple sheets (per wilayah)
  
- [ ] **Export Laporan**
  - [ ] Laporan harian per periode
  - [ ] Statistik per wilayah
  - [ ] Rekap kehadiran tes
  - [ ] Rekap nilai dan kelulusan

**Files to Create:**
```
app/dashboard/download/
└── components/
    ├── ExportDialog.tsx
    ├── ColumnSelector.tsx
    └── ExportProgress.tsx

lib/export/
├── excel.ts
└── templates/
    ├── hafiz-template.ts
    ├── laporan-template.ts
    └── statistik-template.ts
```

**Already have**: `xlsx` library

---

#### 3.2 Export PDF
- [ ] **Generate PDF Reports**
  - [ ] Profil hafiz individual
  - [ ] Piagam kelulusan
  - [ ] Sertifikat insentif
  - [ ] Laporan statistik
  
- [ ] **PDF Features**
  - [ ] Watermark
  - [ ] Digital signature
  - [ ] QR code verification
  - [ ] Custom template

**Libraries:**
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "react-pdf": "^7.7.0"
}
```

**Files to Create:**
```
lib/pdf/
├── generator.ts
├── templates/
│   ├── piagam.ts
│   ├── sertifikat.ts
│   └── laporan.ts
└── utils/
    ├── watermark.ts
    └── qr-verification.ts
```

---

### **FASE 4: Notifications** 📧
**Target**: Minggu 5 (11-17 Jan 2025)  
**Priority**: MEDIUM

#### 4.1 Email Notifications
- [ ] **Email Service Setup**
  - [ ] Integrate Resend/SendGrid
  - [ ] Email templates
  - [ ] Queue system
  
- [ ] **Email Types**
  - [ ] Welcome email (registrasi)
  - [ ] Verifikasi email
  - [ ] Notifikasi jadwal tes
  - [ ] Pengumuman kelulusan
  - [ ] Reminder laporan harian
  - [ ] Approval notifications

**Email Service Options:**
1. **Resend** (Recommended - Modern, Developer-friendly)
2. **SendGrid** (Established, Reliable)
3. **AWS SES** (Cheap, Scalable)

**Files to Create:**
```
lib/email/
├── client.ts
├── templates/
│   ├── welcome.tsx
│   ├── jadwal-tes.tsx
│   ├── kelulusan.tsx
│   └── reminder.tsx
└── queue.ts

app/api/email/
├── send/route.ts
└── webhook/route.ts
```

**Dependencies:**
```json
{
  "resend": "^3.0.0",
  "@react-email/components": "^0.0.14"
}
```

---

#### 4.2 WhatsApp Notifications
- [ ] **WhatsApp Integration**
  - [ ] Integrate Fonnte/Wablas
  - [ ] Message templates
  - [ ] Bulk messaging
  
- [ ] **Message Types**
  - [ ] Konfirmasi pendaftaran
  - [ ] Reminder jadwal tes
  - [ ] Pengumuman kelulusan
  - [ ] Broadcast informasi

**WhatsApp Service Options:**
1. **Fonnte** (Indonesia, Affordable)
2. **Wablas** (Indonesia, Feature-rich)
3. **Twilio WhatsApp API** (Official, Expensive)

**Recommended**: Fonnte (Rp 150k/bulan, unlimited messages)

**Files to Create:**
```
lib/whatsapp/
├── client.ts
├── templates/
│   ├── jadwal-tes.ts
│   ├── kelulusan.ts
│   └── reminder.ts
└── queue.ts

app/api/whatsapp/
├── send/route.ts
└── webhook/route.ts
```

**Dependencies:**
```json
{
  "axios": "^1.6.5"
}
```

---

### **FASE 5: Mobile App** 📱
**Target**: Minggu 6-10 (18 Jan - 21 Feb 2025)  
**Priority**: LOW (Nice to have)

#### 5.1 Technology Stack Decision

**Option 1: React Native (Expo)** ⭐ RECOMMENDED
- ✅ Share code dengan web (React)
- ✅ Expo Go untuk testing cepat
- ✅ OTA updates
- ✅ Build APK & iOS dari cloud
- ❌ Slightly larger app size

**Option 2: Flutter**
- ✅ Fast performance
- ✅ Beautiful UI out of the box
- ❌ Different language (Dart)
- ❌ No code sharing dengan web

**Option 3: PWA (Progressive Web App)**
- ✅ No separate codebase
- ✅ Instant updates
- ✅ Works on all platforms
- ❌ Limited native features
- ❌ Not in app stores

**DECISION**: Start with **PWA**, then **React Native** if needed

---

#### 5.2 PWA Implementation
- [ ] **PWA Setup**
  - [ ] Service worker
  - [ ] Offline support
  - [ ] Install prompt
  - [ ] Push notifications
  
- [ ] **Mobile-Optimized UI**
  - [ ] Bottom navigation
  - [ ] Touch-friendly buttons
  - [ ] Swipe gestures
  - [ ] Mobile-first responsive

**Files to Create:**
```
public/
├── manifest.json
├── service-worker.js
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png

app/
└── (mobile)/
    ├── layout.tsx
    └── components/
        ├── BottomNav.tsx
        └── MobileHeader.tsx
```

**Dependencies:**
```json
{
  "next-pwa": "^5.6.0",
  "workbox-webpack-plugin": "^7.0.0"
}
```

---

#### 5.3 React Native App (Optional)
- [ ] **Setup Expo Project**
  - [ ] Initialize Expo app
  - [ ] Setup navigation
  - [ ] Connect to Supabase
  
- [ ] **Core Features**
  - [ ] Login/Register
  - [ ] Dashboard
  - [ ] Laporan harian
  - [ ] QR Scanner (absensi)
  - [ ] Notifications
  
- [ ] **Build & Deploy**
  - [ ] Build APK (Android)
  - [ ] Build IPA (iOS)
  - [ ] Submit to Play Store
  - [ ] Submit to App Store

**Project Structure:**
```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── laporan.tsx
│   │   ├── quran.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
├── lib/
│   └── supabase.ts
└── app.json
```

**Commands:**
```bash
# Create Expo app
npx create-expo-app mobile --template tabs

# Install dependencies
cd mobile
npx expo install @supabase/supabase-js expo-camera expo-barcode-scanner

# Run on device
npx expo start

# Build APK
eas build --platform android

# Build iOS
eas build --platform ios
```

---

## 📊 Timeline Summary

| Fase | Fitur | Durasi | Target Selesai |
|------|-------|--------|----------------|
| 1 | Data Management Enhancement | 2 minggu | 27 Des 2024 |
| 2 | Upload & OCR | 1 minggu | 3 Jan 2025 |
| 3 | Export & Reporting | 1 minggu | 10 Jan 2025 |
| 4 | Notifications | 1 minggu | 17 Jan 2025 |
| 5 | Mobile App (PWA) | 2 minggu | 31 Jan 2025 |
| 5 | Mobile App (React Native) | 3 minggu | 21 Feb 2025 |

**Total**: 10 minggu (2.5 bulan)

---

## 💰 Estimasi Biaya

### **Infrastructure & Services**

| Service | Purpose | Cost/Month |
|---------|---------|------------|
| Supabase Pro | Database, Auth, Storage | $25 |
| Vercel Pro | Hosting | $20 |
| Resend | Email (50k emails) | $20 |
| Fonnte | WhatsApp | Rp 150k (~$10) |
| Google Cloud Vision | OCR (1000 requests) | $1.50 |
| **TOTAL** | | **~$76.50/month** |

### **One-Time Costs**

| Item | Cost |
|------|------|
| Google Play Developer | $25 (one-time) |
| Apple Developer | $99/year |
| Domain (.id) | Rp 200k/year (~$13) |
| SSL Certificate | Free (Let's Encrypt) |

---

## 🎯 Priority Matrix

### **Must Have (P0)**
1. ✅ Data Hafiz Management - CRUD lengkap
2. ✅ Periode Tes & Kuota
3. ✅ Export Excel
4. ✅ Email Notifications

### **Should Have (P1)**
5. Jadwal & Absensi Tes
6. Export PDF
7. WhatsApp Notifications
8. Upload & OCR KTP

### **Nice to Have (P2)**
9. PWA
10. React Native App
11. Advanced Analytics
12. AI Features (auto-grading, recommendations)

---

## 🚀 Getting Started

### **Fase 1: Data Management (Mulai Sekarang)**

1. **Create Hafiz Form Component**
   ```bash
   # Create files
   touch app/dashboard/hafiz/create/page.tsx
   touch app/dashboard/hafiz/components/HafizForm.tsx
   ```

2. **Install Additional Dependencies**
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

3. **Create API Routes**
   ```bash
   mkdir -p app/api/hafiz
   touch app/api/hafiz/route.ts
   touch app/api/hafiz/[id]/route.ts
   ```

---

## 📝 Next Steps

1. **Review & Approve Roadmap**
   - Confirm priorities
   - Adjust timeline if needed
   - Approve budget

2. **Start Fase 1**
   - Create Hafiz Form
   - Implement CRUD operations
   - Add validation

3. **Setup Services**
   - Create Resend account
   - Create Fonnte account
   - Setup email templates

---

## 📞 Support & Resources

### **Documentation**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev

### **Community**
- Next.js Discord
- Supabase Discord
- React Native Community

---

**Dibuat oleh**: Antigravity AI  
**Untuk**: LPTQ Jawa Timur  
**Versi**: 3.0.0  
**Last Updated**: 13 Desember 2024
