# 🌐 Informasi Akses Aplikasi

**Tanggal**: 12 Januari 2026  
**Waktu**: 10:25 WIB

## ✅ Status Deployment

### 1. GitHub Repository
- ✅ **Status**: Berhasil di-update
- 🔗 **Repository**: https://github.com/hakimarx/huffadz-jatim
- 📊 **Branch**: master

### 2. Aplikasi Lokal
- ✅ **Status**: Berjalan (Port 3000 detected)
- 🔗 **URL Lokal**: http://localhost:3000

### 3. Akses Publik via Ngrok
- ✅ **Status**: Aktif
- 🌍 **URL Publik**: https://be5fc4260ff3.ngrok-free.app
- 🔧 **Dashboard Ngrok**: http://localhost:4040
- 📊 **Port Forwarding**: 3000 → ngrok

---

## 🚀 Cara Akses

### Dari Internet (Public Access)
```
https://be5fc4260ff3.ngrok-free.app
```

### Dari Jaringan Lokal
```
http://localhost:3000
```

---

## 🔑 Login Credentials

Akun admin telah dibuat untuk testing:

- **Email**: `hakimarx@gmail.com`
- **Password**: `password123`
- **Role**: Admin Provinsi

---

## ⚠️ Troubleshooting "Blocked Host" / "Invalid Host Header"

Jika Anda membuka URL ngrok dan melihat error "Blocked request" atau "Invalid Host Header":

1. **Stop server yang sedang berjalan** (Ctrl+C di terminal).
2. **Jalankan ulang dengan command khusus tunnel**:
   ```bash
   npm run dev:tunnel
   ```
   *Command ini menjalankan `next dev --hostname 0.0.0.0` yang mengizinkan akses dari ngrok.*

---

## 🔄 Update ke GitHub

Untuk update kode terbaru ke GitHub:

```bash
cd c:\Users\Administrator\aplikasi\huffadz-jatim
git add .
git commit -m "Deskripsi perubahan"
git push origin master
```
