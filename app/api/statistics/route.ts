import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface StatistikKabko {
    kabupaten_kota: string;
    total_hafiz: number;
    total_lulus: number;
    penerima_insentif_aktif: number;
    pendaftar_tahun_ini: number;
}

interface StatistikOverall {
    total_hafiz: number;
    total_lulus: number;
    total_kabupaten: number;
    total_mengajar: number;
}

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        // Base filter for admin_kabko
        let filterKabko = '';
        const filterParams: unknown[] = [];

        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            filterKabko = ' WHERE kabupaten_kota = ?';
            filterParams.push(user.kabupaten_kota);
        }

        // Overall statistics
        const overallStats = await queryOne<StatistikOverall>(`
      SELECT 
        COUNT(*) as total_hafiz,
        SUM(CASE WHEN status_kelulusan = 'lulus' THEN 1 ELSE 0 END) as total_lulus,
        COUNT(DISTINCT kabupaten_kota) as total_kabupaten,
        SUM(CASE WHEN mengajar = 1 THEN 1 ELSE 0 END) as total_mengajar
      FROM hafiz ${filterKabko}
    `, filterParams);

        // Statistics per year
        const yearlyStats = await query<{ tahun: number; total: number }>(`
      SELECT tahun_tes as tahun, COUNT(*) as total
      FROM hafiz ${filterKabko}
      GROUP BY tahun_tes
      ORDER BY tahun_tes DESC
    `, filterParams);

        // Statistics per kabupaten (only for admin_provinsi)
        let kabkoStats: StatistikKabko[] = [];
        if (user.role === 'admin_provinsi') {
            kabkoStats = await query<StatistikKabko>(`
        SELECT 
          kabupaten_kota,
          COUNT(*) as total_hafiz,
          SUM(CASE WHEN status_kelulusan = 'lulus' THEN 1 ELSE 0 END) as total_lulus,
          SUM(CASE WHEN status_insentif = 'aktif' THEN 1 ELSE 0 END) as penerima_insentif_aktif,
          SUM(CASE WHEN tahun_tes = YEAR(CURRENT_DATE) THEN 1 ELSE 0 END) as pendaftar_tahun_ini
        FROM hafiz
        GROUP BY kabupaten_kota
        ORDER BY total_hafiz DESC
      `);
        }

        // Status kelulusan breakdown
        const statusStats = await query<{ status: string; total: number }>(`
      SELECT status_kelulusan as status, COUNT(*) as total
      FROM hafiz ${filterKabko}
      GROUP BY status_kelulusan
    `, filterParams);

        return NextResponse.json({
            overall: overallStats,
            yearly: yearlyStats,
            perKabupaten: kabkoStats,
            perStatus: statusStats,
        });
    } catch (error) {
        console.error('Statistics GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
