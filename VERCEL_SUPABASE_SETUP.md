# Panduan Setup Vercel + Supabase untuk Huffadz Jatim

## 🚨 MASALAH SAAT INI
Error login menunjukkan Vercel masih terhubung ke TiDB lama:
```
Access denied for user '4K6TwTwqAHa9DAx.root'@'...' (using password: YES)
```

## ✅ LANGKAH PERBAIKAN

### 1. Setup Database Supabase

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda (atau buat baru)
3. Pergi ke **SQL Editor**
4. Copy dan paste isi file `database/supabase_setup.sql`
5. Klik **Run** untuk membuat semua tabel

### 2. Dapatkan Connection String Supabase

1. Di Supabase Dashboard, pergi ke **Settings** > **Database**
2. Scroll ke bagian **Connection string**
3. Pilih **URI** dan copy connection string
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
5. Ganti `[PASSWORD]` dengan database password Anda

### 3. Update Environment Variables di Vercel

1. Buka **Vercel Dashboard**: https://vercel.com/dashboard
2. Pilih project **huffadz-jatim**
3. Pergi ke **Settings** > **Environment Variables**
4. **HAPUS** semua variable database lama:
   - `DATABASE_HOST`
   - `DATABASE_PORT`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`
   - `DATABASE_SSL`

5. **TAMBAH** variable baru:
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
   | `SESSION_SECRET` | `[random string 32+ karakter]` |
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_APP_URL` | `https://huffadz-jatim.vercel.app` |

6. Pastikan variable di-apply ke **All Environments** (Production, Preview, Development)

### 4. Redeploy Aplikasi

1. Di Vercel Dashboard, pergi ke **Deployments**
2. Klik **...** pada deployment terbaru
3. Pilih **Redeploy**
4. Tunggu hingga deployment selesai

### 5. Insert Data Admin

Jalankan SQL ini di Supabase SQL Editor untuk menambah admin:

```sql
-- Password: 123456 (bcrypt hash)
INSERT INTO public.users (email, password, nama, role, is_active)
VALUES (
  'hakimarx@gmail.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMye2AYLmW0RqcqV4G3X0x7P.Y1wDqzRfGa', 
  'Administrator Provinsi', 
  'admin_provinsi', 
  TRUE
)
ON CONFLICT (email) DO UPDATE SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMye2AYLmW0RqcqV4G3X0x7P.Y1wDqzRfGa',
  is_active = TRUE;

-- Admin Kabupaten (contoh)
INSERT INTO public.users (email, password, nama, role, kabupaten_kota, is_active)
VALUES (
  'admin.surabaya@gmail.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMye2AYLmW0RqcqV4G3X0x7P.Y1wDqzRfGa', 
  'Admin Surabaya', 
  'admin_kabko',
  'Kota Surabaya',
  TRUE
)
ON CONFLICT (email) DO NOTHING;
```

## 🧪 TEST LOGIN

Setelah semua selesai, test login dengan:

| Role | Email | Password |
|------|-------|----------|
| Admin Provinsi | hakimarx@gmail.com | 123456 |
| Admin Kabupaten | admin.surabaya@gmail.com | 123456 |
| Hafiz | (daftar baru via Register) | - |

## ❓ TROUBLESHOOTING

### Error: "relation users does not exist"
→ Jalankan `supabase_setup.sql` di SQL Editor Supabase

### Error: "password authentication failed"
→ Cek password database di Supabase Settings > Database

### Error: "connection refused"
→ Pastikan format DATABASE_URL benar dan tidak ada spasi/karakter tersembunyi

### Error: "invalid enum"
→ Jalankan bagian CREATE TYPE di supabase_setup.sql terlebih dahulu
