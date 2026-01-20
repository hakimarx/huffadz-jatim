-- =====================================================
-- RLS POLICIES FOR USER MANAGEMENT
-- Allows Admin Provinsi to manage Admin Kab/Ko users
-- Allows Admin Kab/Ko to manage Hafiz users in their region
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor

-- =====================================================
-- 1. DROP EXISTING CONFLICTING POLICIES (if any)
-- =====================================================
DROP POLICY IF EXISTS "Admin prov manage admin_kabko" ON public.users;
DROP POLICY IF EXISTS "Admin kabko manage hafiz" ON public.users;
DROP POLICY IF EXISTS "Admin kabko insert hafiz" ON public.users;
DROP POLICY IF EXISTS "Admin kabko update hafiz" ON public.users;
DROP POLICY IF EXISTS "Admin kabko delete hafiz" ON public.users;

-- =====================================================
-- 2. CREATE NEW POLICIES FOR USER MANAGEMENT
-- =====================================================

-- Policy: Admin Provinsi can INSERT Admin Kab/Ko users
CREATE POLICY "Admin prov insert admin_kabko" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin_provinsi() 
    AND role = 'admin_kabko'
  );

-- Policy: Admin Provinsi can UPDATE Admin Kab/Ko users
CREATE POLICY "Admin prov update admin_kabko" ON public.users
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

-- Policy: Admin Provinsi can DELETE Admin Kab/Ko users
CREATE POLICY "Admin prov delete admin_kabko" ON public.users
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin_provinsi() 
    AND role = 'admin_kabko'
  );

-- =====================================================
-- 3. POLICIES FOR ADMIN KAB/KO MANAGING HAFIZ
-- =====================================================

-- Helper function to get current user's kabupaten_kota
CREATE OR REPLACE FUNCTION public.get_user_kabupaten_kota()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT kabupaten_kota 
    FROM public.users 
    WHERE id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_kabupaten_kota() TO authenticated, anon;

-- Policy: Admin Kab/Ko can VIEW Hafiz in their region
CREATE POLICY "Admin kabko view hafiz in region" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    role = 'hafiz'
    AND EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin_kabko'
      AND admin_user.kabupaten_kota = users.kabupaten_kota
    )
  );

-- Policy: Admin Kab/Ko can INSERT Hafiz in their region
CREATE POLICY "Admin kabko insert hafiz in region" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'hafiz'
    AND EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin_kabko'
      AND admin_user.kabupaten_kota = kabupaten_kota
    )
  );

-- Policy: Admin Kab/Ko can UPDATE Hafiz in their region
CREATE POLICY "Admin kabko update hafiz in region" ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    role = 'hafiz'
    AND EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin_kabko'
      AND admin_user.kabupaten_kota = users.kabupaten_kota
    )
  )
  WITH CHECK (
    role = 'hafiz'
    AND EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin_kabko'
      AND admin_user.kabupaten_kota = kabupaten_kota
    )
  );

-- Policy: Admin Kab/Ko can DELETE Hafiz in their region
CREATE POLICY "Admin kabko delete hafiz in region" ON public.users
  FOR DELETE
  TO authenticated
  USING (
    role = 'hafiz'
    AND EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin_kabko'
      AND admin_user.kabupaten_kota = users.kabupaten_kota
    )
  );

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify policies are created:

-- List all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';

-- Test as Admin Provinsi (should see all admin_kabko users)
-- SELECT * FROM public.users WHERE role = 'admin_kabko';

-- Test as Admin Kab/Ko (should see hafiz in their region only)
-- SELECT * FROM public.users WHERE role = 'hafiz';
