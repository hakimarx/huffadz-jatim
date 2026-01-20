-- =====================================================
-- Script: Create Mutation History Table
-- =====================================================
-- Purpose: Menyimpan riwayat mutasi hafiz antar kabupaten/kota
-- Date: 15 Desember 2024
-- =====================================================

-- Create table for mutation history
CREATE TABLE IF NOT EXISTS public.mutasi_hafiz (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hafiz_id UUID REFERENCES public.hafiz(id) ON DELETE CASCADE NOT NULL,
    kabupaten_kota_asal TEXT NOT NULL,
    kabupaten_kota_tujuan TEXT NOT NULL,
    tanggal_mutasi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    alasan TEXT,
    diproses_oleh UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mutasi_hafiz_id ON public.mutasi_hafiz(hafiz_id);
CREATE INDEX IF NOT EXISTS idx_mutasi_tanggal ON public.mutasi_hafiz(tanggal_mutasi);

-- Enable RLS
ALTER TABLE public.mutasi_hafiz ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mutasi_hafiz
CREATE POLICY "Admin prov manage mutasi" ON public.mutasi_hafiz
    FOR ALL USING (public.is_admin_provinsi());

CREATE POLICY "Admin kabko view region mutasi" ON public.mutasi_hafiz
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hafiz h
            WHERE h.id = mutasi_hafiz.hafiz_id
            AND public.is_admin_kabko(h.kabupaten_kota)
        )
        OR public.is_admin_kabko(mutasi_hafiz.kabupaten_kota_asal)
        OR public.is_admin_kabko(mutasi_hafiz.kabupaten_kota_tujuan)
    );

CREATE POLICY "Admin kabko insert mutasi" ON public.mutasi_hafiz
    FOR INSERT WITH CHECK (
        public.is_admin_kabko(kabupaten_kota_asal)
        OR public.is_admin_provinsi()
    );

-- Grant permissions
GRANT ALL ON public.mutasi_hafiz TO authenticated;

-- Summary
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tabel mutasi_hafiz berhasil dibuat!';
    RAISE NOTICE '============================================';
END $$;
