# 🔧 FIX ERROR: Column 'email' Not Found (PGRST204)

**Date**: 14 Desember 2024, 07:00 WIB  
**Error**: `Could not find the 'email' column of 'hafiz' in the schema cache (Error code: PGRST204)`  
**Status**: ✅ Solution Ready

---

## 🐛 Problem

Error `PGRST204` terjadi karena:
1. **Kolom `email` tidak ada** di tabel `hafiz` di database Supabase
2. **Schema cache** Supabase belum sync dengan schema.sql
3. Kemungkinan ada **kolom lain yang juga missing**

---

## ✅ Solution

Saya sudah membuat **migration script** yang akan:
1. ✅ Menambahkan semua kolom yang missing
2. ✅ Refresh schema cache Supabase
3. ✅ Verify semua kolom sudah ada

---

## 📋 Step-by-Step Fix

### **Step 1: Buka Supabase Dashboard**

1. Go to: https://supabase.com
2. Login dengan akun Anda
3. Pilih project **Huffadz Jatim**

---

### **Step 2: Buka SQL Editor**

1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik **"New Query"**

---

### **Step 3: Copy Migration Script**

1. Buka file: `database/07_add_missing_columns.sql`
2. **Copy semua isi file** (Ctrl+A, Ctrl+C)

Atau copy dari sini:

```sql
-- =====================================================
-- Migration Script: Add Missing Columns to hafiz Table
-- =====================================================

-- Add email column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN email TEXT;
        RAISE NOTICE 'Kolom email berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom email sudah ada';
    END IF;
END $$;

-- Add tempat_mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tempat_mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN tempat_mengajar TEXT;
        RAISE NOTICE 'Kolom tempat_mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tempat_mengajar sudah ada';
    END IF;
END $$;

-- Add sertifikat_tahfidz column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'sertifikat_tahfidz'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN sertifikat_tahfidz TEXT;
        RAISE NOTICE 'Kolom sertifikat_tahfidz berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom sertifikat_tahfidz sudah ada';
    END IF;
END $$;

-- Add mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN mengajar BOOLEAN DEFAULT false;
        RAISE NOTICE 'Kolom mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom mengajar sudah ada';
    END IF;
END $$;

-- Add tmt_mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tmt_mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN tmt_mengajar DATE;
        RAISE NOTICE 'Kolom tmt_mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tmt_mengajar sudah ada';
    END IF;
END $$;

-- Add rt column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'rt'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN rt TEXT;
        RAISE NOTICE 'Kolom rt berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom rt sudah ada';
    END IF;
END $$;

-- Add rw column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'rw'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN rw TEXT;
        RAISE NOTICE 'Kolom rw berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom rw sudah ada';
    END IF;
END $$;

-- Add keterangan column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'keterangan'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN keterangan TEXT;
        RAISE NOTICE 'Kolom keterangan berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom keterangan sudah ada';
    END IF;
END $$;

-- Refresh schema cache (important!)
NOTIFY pgrst, 'reload schema';

-- Verify all columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;

-- Summary
DO $$ 
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Semua kolom yang diperlukan sudah ditambahkan';
    RAISE NOTICE 'Schema cache sudah di-refresh';
    RAISE NOTICE '==============================================';
END $$;
```

---

### **Step 4: Paste & Run**

1. **Paste** script ke SQL Editor (Ctrl+V)
2. **Klik "Run"** atau tekan Ctrl+Enter
3. **Tunggu** sampai selesai (sekitar 5-10 detik)

---

### **Step 5: Verify Results**

Anda akan melihat output seperti ini:

```
NOTICE: Kolom email berhasil ditambahkan
NOTICE: Kolom tempat_mengajar berhasil ditambahkan
NOTICE: Kolom sertifikat_tahfidz berhasil ditambahkan
NOTICE: Kolom mengajar berhasil ditambahkan
NOTICE: Kolom tmt_mengajar berhasil ditambahkan
NOTICE: Kolom rt berhasil ditambahkan
NOTICE: Kolom rw berhasil ditambahkan
NOTICE: Kolom keterangan berhasil ditambahkan
NOTICE: ==============================================
NOTICE: Migration completed successfully!
NOTICE: Semua kolom yang diperlukan sudah ditambahkan
NOTICE: Schema cache sudah di-refresh
NOTICE: ==============================================
```

Dan akan ada **tabel hasil** yang menampilkan semua kolom di tabel `hafiz`.

---

### **Step 6: Test Aplikasi**

1. **Kembali ke aplikasi** (browser)
2. **Refresh halaman** (F5 atau Ctrl+R)
3. **Go to** `/dashboard/hafiz/create`
4. **Isi form** dengan data test
5. **Klik "Simpan Data"**
6. **Harus berhasil!** ✅

---

## 📊 Kolom yang Ditambahkan

Script ini akan menambahkan kolom berikut (jika belum ada):

| Column | Type | Description |
|--------|------|-------------|
| `email` | TEXT | Email hafiz |
| `tempat_mengajar` | TEXT | Tempat mengajar |
| `sertifikat_tahfidz` | TEXT | Sertifikat tahfidz |
| `mengajar` | BOOLEAN | Status mengajar |
| `tmt_mengajar` | DATE | Tanggal mulai mengajar |
| `rt` | TEXT | RT |
| `rw` | TEXT | RW |
| `keterangan` | TEXT | Keterangan tambahan |

---

## 🔍 Troubleshooting

### **Q: Script error "permission denied"**
**A**: Pastikan Anda login sebagai **owner** project di Supabase

### **Q: Masih error setelah run script**
**A**: 
1. Tunggu 30 detik (schema cache refresh)
2. Refresh browser (Ctrl+Shift+R - hard refresh)
3. Test lagi

### **Q: Kolom sudah ada tapi masih error**
**A**: Run command ini di SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### **Q: Ingin verify manual**
**A**: Run query ini:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'hafiz'
ORDER BY ordinal_position;
```

---

## ✅ Expected Result

Setelah migration berhasil:
- ✅ Semua kolom ada di tabel `hafiz`
- ✅ Schema cache sudah di-refresh
- ✅ Form tambah hafiz bisa submit
- ✅ Data tersimpan ke database
- ✅ Redirect ke list hafiz

---

## 📝 Next Steps

Setelah migration berhasil:

1. ✅ **Test create hafiz** - harus berhasil
2. ✅ **Test edit hafiz** - harus berhasil
3. ✅ **Test delete hafiz** - harus berhasil
4. ✅ **Test search & filter** - harus berhasil
5. ✅ **Lanjut ke fitur berikutnya**

---

## 🎯 Summary

| Item | Status |
|------|--------|
| **Problem Identified** | ✅ Done |
| **Migration Script Created** | ✅ Done |
| **Solution Documented** | ✅ Done |
| **Ready to Run** | ✅ Yes |

**Action Required**: Run migration script di Supabase SQL Editor

---

**Status**: ⏳ **Waiting for you to run the migration**

Silakan jalankan script dan test hasilnya! 😊

---

**Created by**: Antigravity AI  
**For**: LPTQ Jawa Timur  
**Date**: 14 Desember 2024, 07:00 WIB
