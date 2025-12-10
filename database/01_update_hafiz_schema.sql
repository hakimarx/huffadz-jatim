-- Add columns to hafiz table
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tempat_mengajar TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Optional: Update enum for mengajar if needed, but it's boolean.
-- Since we added tempat_mengajar, we can populate it.
