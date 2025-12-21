-- =====================================================
-- FIX COMPLETE RLS RECURSION - HUFFADZ JATIM
-- =====================================================
-- Problem: "infinite recursion detected in policy for relation 'users'" (Error 42P17)
-- 
-- Root Cause: RLS policies on users table query the users table itself
-- to check for admin roles, causing infinite recursion.
--
-- Solution: Use SECURITY DEFINER functions to bypass RLS when checking roles.
-- =====================================================
-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- =====================================================

-- =========================================
-- STEP 1: CREATE HELPER FUNCTIONS
-- These functions bypass RLS using SECURITY DEFINER
-- =========================================

-- Function to check if current user is admin_provinsi
CREATE OR REPLACE FUNCTION public.is_admin_provinsi()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin_provinsi'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if current user is admin_kabko for a specific region
CREATE OR REPLACE FUNCTION public.is_admin_kabko(kabko TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin_kabko'
    AND kabupaten_kota = kabko
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get current user's kabupaten_kota
CREATE OR REPLACE FUNCTION public.get_user_kabupaten_kota()
RETURNS TEXT AS $$
DECLARE
  kabko TEXT;
BEGIN
  SELECT kabupaten_kota INTO kabko
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  RETURN kabko;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_provinsi() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_kabko(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_kabupaten_kota() TO authenticated, anon;

-- =========================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- =========================================

-- Drop all policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Drop all policies on hafiz table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'hafiz' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.hafiz';
    END LOOP;
END $$;

-- Drop all policies on laporan_harian table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'laporan_harian' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.laporan_harian';
    END LOOP;
END $$;

-- =========================================
-- STEP 3: ENABLE RLS
-- =========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_harian ENABLE ROW LEVEL SECURITY;

-- =========================================
-- STEP 4: CREATE NEW POLICIES FOR USERS TABLE
-- Simple, non-recursive policies
-- =========================================

-- SELECT: All authenticated users can read users table
-- This is safe because sensitive data should not be in this table
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: User can insert their own row
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (auth.uid() = id);

-- UPDATE: User can update their own row
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: Only admin_provinsi can delete (using helper function)
CREATE POLICY "users_delete_admin" ON public.users
    FOR DELETE
    TO authenticated
    USING (public.is_admin_provinsi());

-- =========================================
-- STEP 5: CREATE NEW POLICIES FOR HAFIZ TABLE
-- Using helper functions to avoid recursion
-- =========================================

-- SELECT: Admin provinsi sees all, admin kabko sees their region, hafiz sees own
CREATE POLICY "hafiz_select" ON public.hafiz
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin_provinsi()
        OR public.is_admin_kabko(kabupaten_kota)
        OR user_id = auth.uid()
    );

-- INSERT: Only admins can insert
CREATE POLICY "hafiz_insert" ON public.hafiz
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_provinsi()
        OR public.is_admin_kabko(kabupaten_kota)
    );

-- UPDATE: Admin provinsi can update all, admin kabko their region, hafiz their own
CREATE POLICY "hafiz_update" ON public.hafiz
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_provinsi()
        OR public.is_admin_kabko(kabupaten_kota)
        OR user_id = auth.uid()
    );

-- DELETE: Only admins can delete
CREATE POLICY "hafiz_delete" ON public.hafiz
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_provinsi()
        OR public.is_admin_kabko(kabupaten_kota)
    );

-- =========================================
-- STEP 6: CREATE NEW POLICIES FOR LAPORAN_HARIAN TABLE
-- =========================================

-- SELECT: All authenticated can view (filtered by application)
CREATE POLICY "laporan_select" ON public.laporan_harian
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Hafiz can insert their own reports
CREATE POLICY "laporan_insert" ON public.laporan_harian
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.hafiz 
            WHERE id = laporan_harian.hafiz_id 
            AND user_id = auth.uid()
        )
        OR public.is_admin_provinsi()
    );

-- UPDATE: Hafiz own reports or admin
CREATE POLICY "laporan_update" ON public.laporan_harian
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hafiz 
            WHERE id = laporan_harian.hafiz_id 
            AND user_id = auth.uid()
        )
        OR public.is_admin_provinsi()
    );

-- DELETE: Only admin
CREATE POLICY "laporan_delete" ON public.laporan_harian
    FOR DELETE
    TO authenticated
    USING (public.is_admin_provinsi());

-- =========================================
-- STEP 7: GRANT PERMISSIONS
-- =========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.hafiz TO authenticated;
GRANT ALL ON public.laporan_harian TO authenticated;
GRANT SELECT ON public.users TO anon;

-- =========================================
-- STEP 8: VERIFY
-- =========================================
SELECT 
    '✅ Policies created successfully!' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'hafiz', 'laporan_harian')
ORDER BY tablename, policyname;
