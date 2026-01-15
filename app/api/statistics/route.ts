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

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const year = searchParams.get('year');

    // Handle KabKo Stats
    if (type === 'kabko') {
      let queryStr = `
        SELECT 
          h.kabupaten_kota,
          COUNT(DISTINCT h.id) as total_hafiz,
          COUNT(DISTINCT l.hafiz_id) as hafiz_sudah_lapor,
          COUNT(l.id) as total_laporan,
          SUM(CASE WHEN l.status_verifikasi = 'disetujui' THEN 1 ELSE 0 END) as laporan_disetujui,
          SUM(CASE WHEN l.status_verifikasi = 'pending' THEN 1 ELSE 0 END) as laporan_pending,
          SUM(CASE WHEN l.status_verifikasi = 'ditolak' THEN 1 ELSE 0 END) as laporan_ditolak
        FROM hafiz h
        LEFT JOIN laporan_harian l ON h.id = l.hafiz_id
      `;

      const params: any[] = [];

      if (year) {
        queryStr += ` AND YEAR(l.tanggal) = ?`;
        params.push(year);
      }

      // Filter for admin_kabko
      if (user.role === 'admin_kabko' && user.kabupaten_kota) {
        queryStr += ` WHERE h.kabupaten_kota = ?`;
        params.push(user.kabupaten_kota);
      }

      queryStr += ` GROUP BY h.kabupaten_kota ORDER BY h.kabupaten_kota`;

      const stats = await query<any>(queryStr, params);

      const formattedStats = stats.map(s => ({
        kabupaten_kota: s.kabupaten_kota,
        total_hafiz: Number(s.total_hafiz),
        hafiz_sudah_lapor: Number(s.hafiz_sudah_lapor),
        total_laporan: Number(s.total_laporan),
        laporan_disetujui: Number(s.laporan_disetujui),
        laporan_pending: Number(s.laporan_pending),
        laporan_ditolak: Number(s.laporan_ditolak),
        persentase_lapor: s.total_hafiz > 0 ? Math.round((s.hafiz_sudah_lapor / s.total_hafiz) * 100) : 0
      }));

      return NextResponse.json(formattedStats);
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

    // Gender statistics
    let genderStats = { L: 0, P: 0 };
    try {
      const genderResult = await query<{ jenis_kelamin: string; total: number }>(`
        SELECT jenis_kelamin, COUNT(*) as total
        FROM hafiz ${filterKabko}
        GROUP BY jenis_kelamin
      `, filterParams);

      genderResult.forEach(row => {
        if (row.jenis_kelamin === 'L') genderStats.L = Number(row.total);
        else if (row.jenis_kelamin === 'P') genderStats.P = Number(row.total);
      });
    } catch (e) {
      console.log('No gender data');
    }

    // Age statistics
    let ageStats = { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 };
    try {
      const ageResult = await queryOne<{
        age_lt_20: number;
        age_20_29: number;
        age_30_39: number;
        age_gte_40: number;
      }>(`
        SELECT
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 20 THEN 1 ELSE 0 END) as age_lt_20,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 20 AND 29 THEN 1 ELSE 0 END) as age_20_29,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 30 AND 39 THEN 1 ELSE 0 END) as age_30_39,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 40 THEN 1 ELSE 0 END) as age_gte_40
        FROM hafiz ${filterKabko}
      `, filterParams);

      if (ageResult) {
        ageStats = {
          '<20': Number(ageResult.age_lt_20) || 0,
          '20-29': Number(ageResult.age_20_29) || 0,
          '30-39': Number(ageResult.age_30_39) || 0,
          '40+': Number(ageResult.age_gte_40) || 0
        };
      }
    } catch (e) {
      console.log('No age data');
    }

    const responseData = {
      overall: overallStats,
      yearly: yearlyStats,
      perStatus: statusStats,
      gender: genderStats,
      age: ageStats
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

