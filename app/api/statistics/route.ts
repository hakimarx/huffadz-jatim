import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Simple in-memory cache for statistics (5 minutes)
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(kabko?: string): string {
  return `stats_${kabko || 'all'}`;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

    if (!authenticated || !user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Check cache first
    const cacheKey = getCacheKey(user.kabupaten_kota ?? undefined);
    const cached = statsCache.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
      console.log(`📊 Statistics from cache for ${user.kabupaten_kota || 'all'}`);
      return NextResponse.json(cached.data);
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
      // Optimized single query with aggregation
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

    // Statistics per year - optimized with ORDER BY using index
    let yearlyStats: { tahun: number; total: number }[] = [];
    try {
      yearlyStats = await query<{ tahun: number; total: number }>(`
        SELECT tahun_tes as tahun, COUNT(*) as total
        FROM hafiz ${filterKabko}
        GROUP BY tahun_tes
        ORDER BY tahun_tes DESC
        LIMIT 20
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

    const responseData = {
      overall: overallStats,
      yearly: yearlyStats,
      perStatus: statusStats,
    };

    // Store in cache
    statsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);
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

