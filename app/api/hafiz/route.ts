import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute, DBHafiz } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - List hafiz with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const kabupaten = searchParams.get('kabupaten') || '';
        const tahun = searchParams.get('tahun') || '';
        const status = searchParams.get('status') || '';

        const offset = (page - 1) * limit;

        // Build query with filters
        let whereClause = '1=1';
        const params: unknown[] = [];

        // Filter by kabupaten for admin_kabko
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            whereClause += ' AND kabupaten_kota = ?';
            params.push(user.kabupaten_kota);
        } else if (kabupaten) {
            whereClause += ' AND kabupaten_kota = ?';
            params.push(kabupaten);
        }

        // Search filter
        if (search) {
            whereClause += ' AND (nama LIKE ? OR nik LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Year filter
        if (tahun) {
            whereClause += ' AND tahun_tes = ?';
            params.push(parseInt(tahun));
        }

        // Status filter
        if (status) {
            whereClause += ' AND status_kelulusan = ?';
            params.push(status);
        }

        // Get total count
        const countResult = await queryOne<{ total: number }>(
            `SELECT COUNT(*) as total FROM hafiz WHERE ${whereClause}`,
            params
        );
        const total = countResult?.total || 0;

        // Get hafiz list
        const hafizList = await query<DBHafiz>(
            `SELECT * FROM hafiz WHERE ${whereClause} ORDER BY nama ASC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return NextResponse.json({
            data: hafizList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Hafiz GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new hafiz
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        const requiredFields = ['nik', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
            'alamat', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota', 'tahun_tes'];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `Field ${field} wajib diisi` },
                    { status: 400 }
                );
            }
        }

        // Admin kabko can only add hafiz in their region
        if (user.role === 'admin_kabko' && data.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json(
                { error: 'Anda hanya dapat menambah hafiz di wilayah Anda' },
                { status: 403 }
            );
        }

        // Check if NIK already exists
        const existing = await queryOne<DBHafiz>(
            'SELECT id FROM hafiz WHERE nik = ?',
            [data.nik]
        );

        if (existing) {
            return NextResponse.json(
                { error: 'NIK sudah terdaftar' },
                { status: 400 }
            );
        }

        // Insert new hafiz
        const insertId = await insert(
            `INSERT INTO hafiz (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
        alamat, rt, rw, desa_kelurahan, kecamatan, kabupaten_kota,
        telepon, email, sertifikat_tahfidz, mengajar, tmt_mengajar,
        tempat_mengajar, tahun_tes, status_kelulusan, nilai_tahfidz,
        nilai_wawasan, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nik, data.nama, data.tempat_lahir, data.tanggal_lahir, data.jenis_kelamin,
                data.alamat, data.rt || null, data.rw || null, data.desa_kelurahan, data.kecamatan,
                data.kabupaten_kota, data.telepon || null, data.email || null,
                data.sertifikat_tahfidz || null, data.mengajar ? 1 : 0, data.tmt_mengajar || null,
                data.tempat_mengajar || null, data.tahun_tes, data.status_kelulusan || 'pending',
                data.nilai_tahfidz || null, data.nilai_wawasan || null, data.keterangan || null
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Hafiz berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Hafiz POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
