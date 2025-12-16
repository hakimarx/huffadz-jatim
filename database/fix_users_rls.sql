-- =====================================================
-- FIX RLS POLICY FOR USERS TABLE - HAFIZ REGISTRATION
-- Error: "new row violates row-level security policy for table 'users'"
-- 
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. Drop existing policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- 2. Create new policies for users table

-- SELECT: Semua authenticated user bisa melihat data users (untuk admin access)
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Izinkan insert untuk authenticated users dengan id yang sama dengan auth.uid()
-- OR ketika INSERT dilakukan oleh service role (untuk sign-up trigger)
CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        -- User bisa insert row untuk dirinya sendiri
        (auth.uid() = id)
        -- ATAU jika belum ada user dengan id tersebut (untuk registrasi baru via trigger)
        OR NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    );

-- UPDATE: User hanya bisa update data mereka sendiri
CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: Hanya admin yang bisa hapus (optional, disabled by default)
-- CREATE POLICY "users_delete_policy" ON public.users
--     FOR DELETE
--     TO authenticated
--     USING (
--         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin_provinsi')
--     );

-- =====================================================
-- ALTERNATIVE: Disable RLS for users table if issue persists
-- Uncomment below if the above doesn't work
-- =====================================================
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE TRIGGER FOR AUTO-INSERT USER ON SIGN UP
-- This triggers when a new user signs up via Supabase Auth
-- =====================================================

-- First, drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, nama, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'hafiz'),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT INSERT ON public.users TO anon;

-- =====================================================
-- VERIFY THE CHANGES
-- =====================================================
SELECT 
    'Policies on users table:' as info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

SELECT 'Trigger created successfully!' as result;
