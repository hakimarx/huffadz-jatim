-- =====================================================
-- POPULATE DATABASE WITH SAMPLE DATA
-- Script untuk mengisi database dengan data sample
-- =====================================================

-- =====================================================
-- 1. INSERT ADMIN USERS
-- =====================================================

-- Admin Provinsi
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.provinsi@lptq.jatimprov.go.id',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, nama, kabupaten_kota, telepon, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.provinsi@lptq.jatimprov.go.id',
  'admin_provinsi',
  'Admin Provinsi LPTQ Jawa Timur',
  'Provinsi Jawa Timur',
  '031-1234567',
  true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT ADMIN KAB/KO (38 Kabupaten/Kota)
-- =====================================================

-- Helper function untuk generate admin kab/ko
DO $$
DECLARE
  kabko_list TEXT[] := ARRAY[
    'Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Blitar', 'Kota Mojokerto',
    'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu',
    'Kabupaten Gresik', 'Kabupaten Sidoarjo', 'Kabupaten Mojokerto', 'Kabupaten Jombang',
    'Kabupaten Bojonegoro', 'Kabupaten Tuban', 'Kabupaten Lamongan', 'Kabupaten Madiun',
    'Kabupaten Magetan', 'Kabupaten Ngawi', 'Kabupaten Ponorogo', 'Kabupaten Pacitan',
    'Kabupaten Kediri', 'Kabupaten Nganjuk', 'Kabupaten Blitar', 'Kabupaten Tulungagung',
    'Kabupaten Trenggalek', 'Kabupaten Malang', 'Kabupaten Pasuruan', 'Kabupaten Probolinggo',
    'Kabupaten Lumajang', 'Kabupaten Jember', 'Kabupaten Bondowoso', 'Kabupaten Situbondo',
    'Kabupaten Banyuwangi', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep',
    'Kabupaten Bangkalan'
  ];
  kabko_name TEXT;
  email_prefix TEXT;
  user_id UUID;
  counter INT := 2;
BEGIN
  FOREACH kabko_name IN ARRAY kabko_list
  LOOP
    user_id := ('00000000-0000-0000-0000-0000000000' || LPAD(counter::TEXT, 2, '0'))::UUID;
    email_prefix := LOWER(REPLACE(REPLACE(kabko_name, 'Kabupaten ', ''), 'Kota ', ''));
    email_prefix := REPLACE(email_prefix, ' ', '');
    
    -- Insert to auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      user_id,
      'admin.' || email_prefix || '@lptq.jatimprov.go.id',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert to public.users
    INSERT INTO public.users (id, email, role, nama, kabupaten_kota, telepon, is_active)
    VALUES (
      user_id,
      'admin.' || email_prefix || '@lptq.jatimprov.go.id',
      'admin_kabko',
      'Admin ' || kabko_name,
      kabko_name,
      '081' || LPAD(counter::TEXT, 9, '0'),
      true
    ) ON CONFLICT (id) DO NOTHING;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- =====================================================
-- 3. INSERT SAMPLE HUFFADZ DATA
-- =====================================================

-- Sample Huffadz (100 data untuk testing)
DO $$
DECLARE
  i INT;
  kabko_list TEXT[] := ARRAY[
    'Kota Surabaya', 'Kabupaten Sidoarjo', 'Kabupaten Gresik', 'Kota Malang',
    'Kabupaten Jember', 'Kabupaten Banyuwangi', 'Kabupaten Malang'
  ];
  nama_depan TEXT[] := ARRAY['Muhammad', 'Ahmad', 'Abdullah', 'Umar', 'Ali', 'Hasan', 'Husain'];
  nama_belakang TEXT[] := ARRAY['Ridwan', 'Hakim', 'Syaifuddin', 'Aziz', 'Fauzi', 'Ramadhan'];
  nama_perempuan TEXT[] := ARRAY['Fatimah', 'Aisyah', 'Khadijah', 'Maryam', 'Zainab', 'Ruqayyah'];
  tahun_tes INT[] := ARRAY[2015, 2016, 2018, 2019, 2021, 2022, 2023, 2024];
  random_kabko TEXT;
  random_nama TEXT;
  random_tahun INT;
  is_lulus BOOLEAN;
  hafiz_id UUID;
  user_id UUID;
BEGIN
  FOR i IN 1..100 LOOP
    hafiz_id := gen_random_uuid();
    user_id := gen_random_uuid();
    random_kabko := kabko_list[1 + floor(random() * array_length(kabko_list, 1))];
    random_tahun := tahun_tes[1 + floor(random() * array_length(tahun_tes, 1))];
    is_lulus := random() > 0.3; -- 70% lulus
    
    -- Generate nama
    IF random() > 0.5 THEN
      random_nama := nama_depan[1 + floor(random() * array_length(nama_depan, 1))] || ' ' ||
                     nama_belakang[1 + floor(random() * array_length(nama_belakang, 1))];
    ELSE
      random_nama := nama_perempuan[1 + floor(random() * array_length(nama_perempuan, 1))] || ' ' ||
                     nama_belakang[1 + floor(random() * array_length(nama_belakang, 1))];
    END IF;
    
    -- Insert hafiz user account
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      user_id,
      'hafiz' || i || '@example.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO public.users (id, email, role, nama, kabupaten_kota, is_active)
    VALUES (
      user_id,
      'hafiz' || i || '@example.com',
      'hafiz',
      random_nama,
      random_kabko,
      true
    ) ON CONFLICT DO NOTHING;
    
    -- Insert hafiz data
    INSERT INTO public.hafiz (
      id, user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
      alamat, rt, rw, desa_kelurahan, kecamatan, kabupaten_kota,
      telepon, email, sertifikat_tahfidz, mengajar, tahun_tes,
      status_kelulusan, nilai_tahfidz, nilai_wawasan, status_insentif
    ) VALUES (
      hafiz_id,
      user_id,
      '35' || LPAD((78000000000 + i)::TEXT, 14, '0'),
      random_nama,
      CASE 
        WHEN random_kabko LIKE '%Surabaya%' THEN 'Surabaya'
        WHEN random_kabko LIKE '%Malang%' THEN 'Malang'
        WHEN random_kabko LIKE '%Sidoarjo%' THEN 'Sidoarjo'
        ELSE 'Jember'
      END,
      DATE '1990-01-01' + (random() * 10000)::INT,
      CASE WHEN random() > 0.5 THEN 'L' ELSE 'P' END,
      'Jl. Raya No. ' || i,
      LPAD((1 + floor(random() * 10))::TEXT, 3, '0'),
      LPAD((1 + floor(random() * 10))::TEXT, 3, '0'),
      'Kelurahan ' || i,
      'Kecamatan ' || (1 + floor(random() * 5))::TEXT,
      random_kabko,
      '081' || LPAD(i::TEXT, 9, '0'),
      'hafiz' || i || '@example.com',
      CASE 
        WHEN random() > 0.7 THEN '30 Juz'
        WHEN random() > 0.4 THEN '20 Juz'
        ELSE '10 Juz'
      END,
      random() > 0.6,
      random_tahun,
      CASE WHEN is_lulus THEN 'lulus' ELSE 'tidak_lulus' END,
      CASE WHEN is_lulus THEN 75 + (random() * 25)::NUMERIC(5,2) ELSE 50 + (random() * 24)::NUMERIC(5,2) END,
      CASE WHEN is_lulus THEN 75 + (random() * 25)::NUMERIC(5,2) ELSE 50 + (random() * 24)::NUMERIC(5,2) END,
      CASE WHEN is_lulus THEN 'aktif' ELSE 'tidak_aktif' END
    );
    
    -- Insert sample laporan harian untuk huffadz yang lulus
    IF is_lulus AND random() > 0.5 THEN
      INSERT INTO public.laporan_harian (
        hafiz_id, tanggal, jenis_kegiatan, deskripsi, lokasi, durasi_menit, status_verifikasi
      ) VALUES
      (hafiz_id, CURRENT_DATE - 1, 'mengajar', 'Mengajar tahfidz anak-anak', 'TPQ Al-Ikhlas', 120, 'disetujui'),
      (hafiz_id, CURRENT_DATE - 2, 'murojah', 'Muroja''ah Juz 1-5', 'Masjid Al-Akbar', 90, 'disetujui'),
      (hafiz_id, CURRENT_DATE - 3, 'khataman', 'Khataman 30 Juz', 'Pondok Pesantren', 180, 'pending');
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. UPDATE KUOTA PER KABUPATEN
-- =====================================================

-- Get periode_tes_id for 2024
DO $$
DECLARE
  periode_2024_id UUID;
  kabko_record RECORD;
BEGIN
  SELECT id INTO periode_2024_id FROM public.periode_tes WHERE tahun = 2024 LIMIT 1;
  
  IF periode_2024_id IS NOT NULL THEN
    FOR kabko_record IN SELECT DISTINCT kabupaten_kota FROM public.hafiz WHERE tahun_tes = 2024
    LOOP
      INSERT INTO public.kuota (periode_tes_id, kabupaten_kota, total_pendaftar, kuota_diterima)
      SELECT 
        periode_2024_id,
        kabko_record.kabupaten_kota,
        COUNT(*),
        COUNT(CASE WHEN status_kelulusan = 'lulus' THEN 1 END)
      FROM public.hafiz
      WHERE kabupaten_kota = kabko_record.kabupaten_kota AND tahun_tes = 2024
      ON CONFLICT (periode_tes_id, kabupaten_kota) DO UPDATE
      SET 
        total_pendaftar = EXCLUDED.total_pendaftar,
        kuota_diterima = EXCLUDED.kuota_diterima,
        updated_at = NOW();
    END LOOP;
  END IF;
END $$;

-- =====================================================
-- 5. INSERT SAMPLE PENGUJI
-- =====================================================

INSERT INTO public.penguji (nama, gelar, institusi, telepon, email, is_active) VALUES
('Prof. Dr. H. Ahmad Syaifuddin, M.Ag', 'Profesor', 'UIN Sunan Ampel Surabaya', '081234567890', 'ahmad.syaifuddin@uinsby.ac.id', true),
('Dr. H. Muhammad Hasan, M.Pd.I', 'Doktor', 'IAIN Jember', '081234567891', 'muhammad.hasan@iain-jember.ac.id', true),
('Dr. Hj. Fatimah Zahra, M.A', 'Doktor', 'UIN Maulana Malik Ibrahim Malang', '081234567892', 'fatimah.zahra@uin-malang.ac.id', true),
('H. Abdullah Aziz, Lc., M.H.I', 'Magister', 'STAI Al-Qolam Malang', '081234567893', 'abdullah.aziz@staialqolam.ac.id', true),
('Ustadz H. Umar Faruq, S.Pd.I', 'Sarjana', 'Pondok Pesantren Tebuireng', '081234567894', 'umar.faruq@tebuireng.ac.id', true);

-- =====================================================
-- 6. SUMMARY STATISTICS
-- =====================================================

-- Display summary
DO $$
DECLARE
  total_users INT;
  total_hafiz INT;
  total_lulus INT;
  total_laporan INT;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.users;
  SELECT COUNT(*) INTO total_hafiz FROM public.hafiz;
  SELECT COUNT(*) INTO total_lulus FROM public.hafiz WHERE status_kelulusan = 'lulus';
  SELECT COUNT(*) INTO total_laporan FROM public.laporan_harian;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE POPULATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Users: %', total_users;
  RAISE NOTICE 'Total Hafiz: %', total_hafiz;
  RAISE NOTICE 'Total Lulus: %', total_lulus;
  RAISE NOTICE 'Total Laporan: %', total_laporan;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'LOGIN CREDENTIALS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin Provinsi:';
  RAISE NOTICE '  Email: admin.provinsi@lptq.jatimprov.go.id';
  RAISE NOTICE '  Password: admin123';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin Kab/Ko (contoh Surabaya):';
  RAISE NOTICE '  Email: admin.surabaya@lptq.jatimprov.go.id';
  RAISE NOTICE '  Password: admin123';
  RAISE NOTICE '';
  RAISE NOTICE 'Hafiz (contoh):';
  RAISE NOTICE '  Email: hafiz1@example.com';
  RAISE NOTICE '  Password: 123456';
  RAISE NOTICE '========================================';
END $$;
