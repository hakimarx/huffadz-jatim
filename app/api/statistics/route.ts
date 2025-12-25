import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

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

    // Overall statistics - with default values
    let overallStats = {
      total: 0,
      lulus: 0,
      kabupaten: 0,
      mengajar: 0
    };

    try {
      const result = await queryOne<{
        total_hafiz: number;
        total_lulus: number;
        total_kabupaten: number;
        total_mengajar: number;
      }>(`
                SELECT 
                    COUNT(*) as total_hafiz,
                    SUM(CASE WHEN status_kelulusan = 'lulus' THEN 1 ELSE 0 END) as total_lulus,
                    COUNT(DISTINCT kabupaten_kota) as total_kabupaten,
                    SUM(CASE WHEN mengajar = 1 THEN 1 ELSE 0 END) as total_mengajar
                FROM hafiz ${filterKabko}
            `, filterParams);

      if (result) {
        overallStats = {
          total: result.total_hafiz || 0,
          lulus: Number(result.total_lulus) || 0,
          kabupaten: result.total_kabupaten || 0,
          mengajar: Number(result.total_mengajar) || 0
        };
      }
    } catch (e) {
      console.log('No hafiz data yet');
    }

    // Statistics per year
    let yearlyStats: { tahun: number; total: number }[] = [];
    try {
      yearlyStats = await query<{ tahun: number; total: number }>(`
                SELECT tahun_tes as tahun, COUNT(*) as total
                FROM hafiz ${filterKabko}
                GROUP BY tahun_tes
                ORDER BY tahun_tes DESC
            `, filterParams);
    } catch (e) {
      console.log('No yearly data');
    }

    // Status kelulusan breakdown
    let statusStats: { status: string; total: number }[] = [];
    try {
      statusStats = await query<{ status: string; total: number }>(`
                SELECT status_kelulusan as status, COUNT(*) as total
                FROM hafiz ${filterKabko}
                GROUP BY status_kelulusan
            `, filterParams);
    } catch (e) {
      console.log('No status data');
    }

    return NextResponse.json({
      overall: overallStats,
      yearly: yearlyStats,
      perStatus: statusStats,
    });
  } catch (error) {
    console.error('Statistics GET error:', error);
    // Return empty stats instead of error for dashboard to still render
    return NextResponse.json({
      overall: { total: 0, lulus: 0, kabupaten: 0, mengajar: 0 },
      yearly: [],
      perStatus: []
    });
  }
}

