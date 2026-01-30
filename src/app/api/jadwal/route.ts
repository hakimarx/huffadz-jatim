import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Get all jadwal tes
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const periodeId = searchParams.get('periode_id');

        let sql = `
            SELECT 
                j.*,
                p.nama_periode,
                p.tahun
            FROM jadwal_tes j
            JOIN periode_tes p ON j.periode_tes_id = p.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (periodeId) {
            sql += ' AND j.periode_tes_id = ?';
            params.push(periodeId);
        }

        // Filter by region for admin_kabko
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            sql += ' AND j.kabupaten_kota = ?';
            params.push(user.kabupaten_kota);
        }

        sql += ' ORDER BY j.tanggal_tes ASC, j.waktu_mulai ASC';

        const data = await query<any>(sql, params);

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Jadwal GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new jadwal tes
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            periode_tes_id,
            kabupaten_kota,
            tanggal_tes,
            waktu_mulai,
            waktu_selesai,
            lokasi,
            alamat_lengkap,
            kapasitas
        } = body;

        // Validation
        if (!periode_tes_id || !kabupaten_kota || !tanggal_tes || !waktu_mulai || !waktu_selesai || !lokasi) {
            return NextResponse.json(
                { error: 'Semua field wajib diisi' },
                { status: 400 }
            );
        }

        await execute(
            `INSERT INTO jadwal_tes (
                periode_tes_id, kabupaten_kota, tanggal_tes, 
                waktu_mulai, waktu_selesai, lokasi, 
                alamat_lengkap, kapasitas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                periode_tes_id, kabupaten_kota, tanggal_tes,
                waktu_mulai, waktu_selesai, lokasi,
                alamat_lengkap, kapasitas || 0
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Jadwal tes berhasil dibuat'
        });

    } catch (error) {
        console.error('Jadwal POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
