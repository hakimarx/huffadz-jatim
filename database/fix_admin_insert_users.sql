-- =====================================================
-- FIX: ALLOW ADMINS TO INSERT NEW USERS
-- =====================================================
-- Problem: Admin cannot insert new users due to RLS policy
-- Solution: Add policy allowing admin_provinsi and admin_kabko to insert users
-- =====================================================
-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- =====================================================

-- Drop existing insert policy if exists
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_admin" ON public.users;
DROP POLICY IF EXISTS "admin_prov_insert_admin_kabko" ON public.users;
DROP POLICY IF EXISTS "admin_kabko_insert_hafiz" ON public.users;

-- =========================================
-- RECREATE INSERT POLICIES
-- =========================================

-- Allow user to insert their own row (during registration)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (auth.uid() = id);

-- Allow admin_provinsi to insert admin_kabko users
CREATE POLICY "admin_prov_insert_admin_kabko" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_provinsi()
        AND role = 'admin_kabko'
    );

-- Allow admin_kabko to insert hafiz users in their region
CREATE POLICY "admin_kabko_insert_hafiz" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        role = 'hafiz'
        AND public.is_admin_kabko(kabupaten_kota)
    );

-- =========================================
-- ALSO ADD UPDATE POLICIES FOR ADMINS
-- =========================================

-- Drop existing update policies
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

-- Allow user to update their own row
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow admin_provinsi to update admin_kabko users
CREATE POLICY "admin_prov_update_admin_kabko" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_provinsi()
        AND role = 'admin_kabko'
    )
    WITH CHECK (
        public.is_admin_provinsi()
        AND role = 'admin_kabko'
    );

-- Allow admin_kabko to update hafiz users in their region
CREATE POLICY "admin_kabko_update_hafiz" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        role = 'hafiz'
        AND public.is_admin_kabko(kabupaten_kota)
    )
    WITH CHECK (
        role = 'hafiz'
        AND public.is_admin_kabko(kabupaten_kota)
    );

-- =========================================
-- VERIFY
-- =========================================
SELECT 
    '✅ Policies updated!' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;
