-- Fix Infinite Recursion in RLS Policy
-- The issue starts because users table policies often query the users table itself to check for roles, leading to recursion.
-- We need to simplify the policies or use `auth.jwt()` which is safer and faster.

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Admin provinsi can view all hafiz" ON public.hafiz;
DROP POLICY IF EXISTS "Admin kabko can view hafiz in their region" ON public.hafiz;
DROP POLICY IF EXISTS "Admin provinsi can view all users" ON public.users;

-- 2. CREATE OPTIMIZED POLICIES FOR HAFIZ (Using JWT metadata if possible, but fallback to direct simple queries)

-- Allow Admin Provinsi to view ALL hafiz
-- Instead of querying users table again, we can trust the current session IF we had custom claims,
-- but since we don't, we will optimize the query to avoid recursion by NOT joining users table inside users table policy.
-- BUT here we are in HAFIZ table, so querying users table is fine usually, UNLESS users table policy itself is recursive.

-- Let's fix USERS table policy first, as that is the root cause.
-- "Admin provinsi can view all users" -> checks if auth.uid() has role 'admin_provinsi' in users table.
-- If "Users can view own data" is also active, it's fine.
-- The recursion usually happens if a policy on Table A queries Table A.
-- Users table policy queries Users table. 
-- Fix: Use SECURITY DEFINER function or separate admin check.

-- Better approach: Create a helper function to check role safely
CREATE OR REPLACE FUNCTION public.is_admin_provinsi()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin_provinsi'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER runs as owner, bypassing RLS on users table

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-apply Policies using the safe functions

-- USERS TABLE
-- Admin Prov can view all users
CREATE POLICY "Admin prov view all users" ON public.users
  FOR SELECT USING (
    (auth.uid() = id) OR public.is_admin_provinsi()
  );

-- HAFIZ TABLE
-- Admin Prov view all
CREATE POLICY "Admin prov view all hafiz" ON public.hafiz
  FOR SELECT USING (
    public.is_admin_provinsi()
  );

-- Admin Prov INSERT/UPDATE/DELETE (needed for upload)
CREATE POLICY "Admin prov manage hafiz" ON public.hafiz
  FOR ALL USING (
    public.is_admin_provinsi()
  );

-- Admin KabKo view their region
CREATE POLICY "Admin kabko view region hafiz" ON public.hafiz
  FOR SELECT USING (
    public.is_admin_kabko(kabupaten_kota)
  );

-- Hafiz view own
-- (Existing policy is fine: user_id = auth.uid())

-- 4. Enable INSERT for Authenticated users (so upsert works)
-- The "Admin prov manage hafiz" covers ALL operations including INSERT.
-- But standard "authenticated" role needs permission. Grant is already there.

-- 5. Fix Laporan Harian recursion if any
DROP POLICY IF EXISTS "Admin can view laporan in their region" ON public.laporan_harian;

CREATE POLICY "Admin view laporan region" ON public.laporan_harian
  FOR SELECT USING (
    public.is_admin_provinsi() 
    OR 
    EXISTS (
      SELECT 1 FROM public.hafiz h
      WHERE h.id = laporan_harian.hafiz_id
      AND public.is_admin_kabko(h.kabupaten_kota)
    )
  );
