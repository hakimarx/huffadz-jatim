import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, DBPeriodeTes } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - List all periode tes
export async function GET() {
    try {
        const periodeList = await query<DBPeriodeTes>(
            'SELECT * FROM periode_tes ORDER BY tahun DESC'
        );

        return NextResponse.json({ data: periodeList });
    } catch (error) {
        console.error('Periode GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new periode tes (admin provinsi only)
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.tahun || !data.nama_periode || !data.tanggal_mulai || !data.tanggal_selesai) {
            return NextResponse.json(
                { error: 'Tahun, nama periode, tanggal mulai, dan tanggal selesai wajib diisi' },
                { status: 400 }
            );
        }

        const insertId = await insert(
            `INSERT INTO periode_tes (tahun, nama_periode, tanggal_mulai, tanggal_selesai, kuota_total, status, deskripsi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.tahun,
                data.nama_periode,
                data.tanggal_mulai,
                data.tanggal_selesai,
                data.kuota_total || 1000,
                data.status || 'draft',
                data.deskripsi || null
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Periode tes berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Periode POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
