# 🚀 Quick Start Guide - Huffadz Jatim

## Cara Cepat Menjalankan Aplikasi

### 1️⃣ Start Database (Terminal 1)
```bash
.\start_xampp_mysql.bat
```
✅ Tunggu sampai MySQL running

### 2️⃣ Start Next.js App (Terminal 2)
```bash
npm run dev
```
✅ Buka browser: http://localhost:3000

### 3️⃣ Start WhatsApp Server (Terminal 3)
```bash
node scripts/wa-server.js
```
✅ QR Code akan muncul di terminal

### 4️⃣ Connect WhatsApp
1. Buka: http://localhost:3000/dashboard/whatsapp
2. Login sebagai admin
3. Scan QR Code dengan WhatsApp
4. Status akan berubah menjadi "Connected" ✅

## 🔑 Default Admin Login
- **Email:** admin@lptq.jatimprov.go.id
- **Password:** (cek di database atau buat baru)

## 📱 Test WhatsApp

### Kirim Pesan Test
```bash
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "08123456789",
    "message": "Test dari Huffadz Jatim"
  }'
```

### Cek Status
```bash
curl http://localhost:3001/status
```

## ⚡ One-Line Start (PowerShell)
```powershell
# Start semua service sekaligus (butuh 3 terminal)
# Terminal 1
.\start_xampp_mysql.bat

# Terminal 2
npm run dev

# Terminal 3
node scripts/wa-server.js
```

## 🛑 Stop Aplikasi
```bash
# Tekan Ctrl+C di setiap terminal
# Atau kill process:
taskkill /F /IM node.exe
taskkill /F /IM mysqld.exe
```

## 📊 Cek Status Semua Service
```powershell
# Cek MySQL
Get-Process mysqld -ErrorAction SilentlyContinue

# Cek Node processes
Get-Process node -ErrorAction SilentlyContinue

# Cek port usage
netstat -ano | findstr ":3000 :3001 :3306"
```

## 🔧 Troubleshooting Cepat

### Port sudah digunakan?
```bash
# Kill port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Kill port 3001
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

### MySQL tidak start?
1. Buka XAMPP Control Panel
2. Start MySQL manual
3. Atau restart XAMPP

### WhatsApp tidak connect?
1. Hapus folder `wa_auth_info`
2. Restart WhatsApp server
3. Scan QR Code lagi

## 📝 URLs Penting
- **Homepage:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard
- **WhatsApp Dashboard:** http://localhost:3000/dashboard/whatsapp
- **WA API Status:** http://localhost:3001/status
- **WA API QR:** http://localhost:3001/qr

---
**Selamat menggunakan Huffadz Jatim! 🎉**
