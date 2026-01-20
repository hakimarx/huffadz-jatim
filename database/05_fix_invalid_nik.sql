-- Script untuk memperbaiki NIK yang tidak karuan di tabel hafiz
-- Masalah: NIK dalam format scientific notation (3.51E+20) atau format tidak valid

-- 1. Backup data sebelum update (opsional tapi disarankan)
-- CREATE TABLE hafiz_backup AS SELECT * FROM hafiz;

-- 2. Lihat NIK yang bermasalah
SELECT 
    id,
    nik,
    nama,
    kabupaten_kota,
    LENGTH(nik) as nik_length,
    CASE 
        WHEN nik ~ '^[0-9]{16}$' THEN 'VALID'
        WHEN nik ~ 'E\+' OR nik ~ 'e\+' THEN 'SCIENTIFIC_NOTATION'
        WHEN LENGTH(nik) != 16 THEN 'INVALID_LENGTH'
        ELSE 'OTHER_ISSUE'
    END as issue_type
FROM hafiz
WHERE 
    nik !~ '^[0-9]{16}$'  -- NIK yang bukan 16 digit angka
    OR nik ~ 'E\+' OR nik ~ 'e\+'  -- NIK dalam scientific notation
ORDER BY issue_type, id
LIMIT 100;

-- 3. Hapus data dengan NIK yang tidak valid (jika diperlukan)
-- HATI-HATI: Ini akan menghapus data permanen!
-- DELETE FROM hafiz 
-- WHERE 
--     nik ~ 'E\+' OR nik ~ 'e\+'  -- Scientific notation
--     OR LENGTH(nik) < 10  -- NIK terlalu pendek
--     OR nik ~ '[^0-9]';  -- Mengandung karakter non-digit

-- 4. Alternatif: Update NIK yang bisa diperbaiki
-- Untuk NIK yang terlalu pendek, pad dengan 0 di depan
UPDATE hafiz
SET nik = LPAD(REGEXP_REPLACE(nik, '[^0-9]', '', 'g'), 16, '0')
WHERE 
    LENGTH(REGEXP_REPLACE(nik, '[^0-9]', '', 'g')) BETWEEN 10 AND 15
    AND nik !~ '^[0-9]{16}$';

-- 5. Tandai data dengan NIK yang tidak bisa diperbaiki
UPDATE hafiz
SET keterangan = COALESCE(keterangan || '; ', '') || 'NIK tidak valid - perlu verifikasi'
WHERE 
    (nik ~ 'E\+' OR nik ~ 'e\+')  -- Scientific notation
    OR LENGTH(REGEXP_REPLACE(nik, '[^0-9]', '', 'g')) < 10  -- Terlalu pendek
    OR nik !~ '^[0-9]{16}$';  -- Tidak valid

-- 6. Lihat hasil perbaikan
SELECT 
    COUNT(*) as total_hafiz,
    COUNT(CASE WHEN nik ~ '^[0-9]{16}$' THEN 1 END) as valid_nik,
    COUNT(CASE WHEN nik !~ '^[0-9]{16}$' THEN 1 END) as invalid_nik
FROM hafiz;

-- 7. Export data dengan NIK bermasalah untuk verifikasi manual
SELECT 
    id,
    nik,
    nama,
    tempat_lahir,
    tanggal_lahir,
    kabupaten_kota,
    telepon,
    keterangan
FROM hafiz
WHERE nik !~ '^[0-9]{16}$'
ORDER BY kabupaten_kota, nama;

-- CATATAN PENTING:
-- 1. Jalankan query SELECT terlebih dahulu untuk melihat data yang akan diubah
-- 2. Backup data sebelum menjalankan UPDATE atau DELETE
-- 3. NIK dalam scientific notation (3.51E+20) tidak bisa diperbaiki otomatis
--    karena informasi digit asli sudah hilang
-- 4. Data dengan NIK tidak valid sebaiknya di-reimport ulang dengan Excel
--    yang sudah diformat dengan benar (kolom NIK sebagai TEXT, bukan NUMBER)

-- SOLUSI UNTUK IMPORT ULANG:
-- 1. Di Excel, format kolom NIK sebagai TEXT sebelum paste data
-- 2. Atau tambahkan apostrof (') di depan NIK: '3578012345670001
-- 3. Atau gunakan formula: =TEXT(A1,"0000000000000000")
-- 4. Export ke CSV dengan encoding UTF-8
-- 5. Re-import menggunakan aplikasi dengan NIK parser yang sudah diperbaiki
