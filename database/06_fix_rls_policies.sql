-- Enable RLS permissions for INSERT and UPDATE

-- Policies for users table
CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for hafiz table (Import & Registration)
-- Allow Admins to insert data (for Import Excel)
CREATE POLICY "Admins can insert hafiz" ON public.hafiz
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin_provinsi', 'admin_kabko')
    )
  );

-- Allow Admins to update data
CREATE POLICY "Admins can update hafiz" ON public.hafiz
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin_provinsi', 'admin_kabko')
    )
  );

-- Allow Hafiz to insert their own profile (Registration)
CREATE POLICY "Hafiz can insert own profile" ON public.hafiz
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Allow Hafiz to update their own profile
CREATE POLICY "Hafiz can update own profile" ON public.hafiz
  FOR UPDATE USING (
    user_id = auth.uid()
  );
