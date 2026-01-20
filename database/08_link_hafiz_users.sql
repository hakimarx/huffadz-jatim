-- =====================================================
-- Script: Link Hafiz Records to User Accounts
-- =====================================================
-- Purpose: Menghubungkan data hafiz yang sudah ada dengan user accounts
-- yang login menggunakan NIK sebagai email/username
-- Date: 15 Desember 2024
-- =====================================================

-- Method 1: Link by exact email match
-- If user's email matches hafiz's email, link them
UPDATE public.hafiz h
SET user_id = u.id
FROM public.users u
WHERE h.user_id IS NULL
  AND h.email IS NOT NULL
  AND h.email = u.email
  AND u.role = 'hafiz';

-- Method 2: Link by NIK as email prefix
-- If user's email is like 'nik@hafiz.jatim.go.id' or similar pattern
UPDATE public.hafiz h
SET user_id = u.id
FROM public.users u
WHERE h.user_id IS NULL
  AND h.nik IS NOT NULL
  AND (
    u.email = h.nik || '@hafiz.jatim.go.id'
    OR u.email = h.nik || '@huffadz.jatim.go.id'
    OR u.email LIKE h.nik || '@%'
  )
  AND u.role = 'hafiz';

-- Method 3: Link users created from hafiz registration
-- When hafiz registered through the app, their email should match
UPDATE public.hafiz h
SET user_id = u.id
FROM public.users u
WHERE h.user_id IS NULL
  AND u.id IN (
    SELECT id FROM public.users WHERE role = 'hafiz'
  )
  AND h.nik = SPLIT_PART(u.email, '@', 1);

-- Report the results
DO $$
DECLARE
  linked_count INTEGER;
  unlinked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO linked_count FROM public.hafiz WHERE user_id IS NOT NULL;
  SELECT COUNT(*) INTO unlinked_count FROM public.hafiz WHERE user_id IS NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Linking Complete!';
  RAISE NOTICE '- Hafiz dengan user_id: %', linked_count;
  RAISE NOTICE '- Hafiz tanpa user_id: %', unlinked_count;
  RAISE NOTICE '============================================';
END $$;

-- Show unlinked hafiz records for manual review
SELECT 
  id,
  nik,
  nama,
  email,
  kabupaten_kota,
  CASE WHEN user_id IS NULL THEN 'BELUM TERHUBUNG' ELSE 'TERHUBUNG' END as status_link
FROM public.hafiz
WHERE user_id IS NULL
LIMIT 20;
