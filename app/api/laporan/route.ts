import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute, DBLaporanHarian } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - List laporan harian
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || '';
        const hafizId = searchParams.get('hafiz_id') || '';

        const offset = (page - 1) * limit;

        let whereClause = '1=1';
        const params: unknown[] = [];

        // Filter by hafiz_id
        if (hafizId) {
            whereClause += ' AND l.hafiz_id = ?';
            params.push(hafizId);
        }

        // Filter by status
        if (status) {
            whereClause += ' AND l.status_verifikasi = ?';
            params.push(status);
        }

        // Filter by kabupaten for admin_kabko
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            whereClause += ' AND h.kabupaten_kota = ?';
            params.push(user.kabupaten_kota);
        }

        // Get total count
        const countResult = await queryOne<{ total: number }>(
            `SELECT COUNT(*) as total FROM laporan_harian l
       JOIN hafiz h ON l.hafiz_id = h.id
       WHERE ${whereClause}`,
            params
        );
        const total = countResult?.total || 0;

        // Get laporan list with hafiz info
        const laporanList = await query<DBLaporanHarian & { nama_hafiz: string; kabupaten_kota: string }>(
            `SELECT l.*, h.nama as nama_hafiz, h.kabupaten_kota
       FROM laporan_harian l
       JOIN hafiz h ON l.hafiz_id = h.id
       WHERE ${whereClause}
       ORDER BY l.tanggal DESC
       LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return NextResponse.json({
            data: laporanList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Laporan GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new laporan
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.hafiz_id || !data.tanggal || !data.jenis_kegiatan || !data.deskripsi) {
            return NextResponse.json(
                { error: 'Hafiz ID, tanggal, jenis kegiatan, dan deskripsi wajib diisi' },
                { status: 400 }
            );
        }

        const insertId = await insert(
            `INSERT INTO laporan_harian (hafiz_id, tanggal, jenis_kegiatan, deskripsi, foto, lokasi, durasi_menit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.hafiz_id,
                data.tanggal,
                data.jenis_kegiatan,
                data.deskripsi,
                data.foto || null,
                data.lokasi || null,
                data.durasi_menit || null
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Laporan harian berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Laporan POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
