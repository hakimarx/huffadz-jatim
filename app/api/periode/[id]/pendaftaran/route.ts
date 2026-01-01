import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get pendaftaran list for a periode
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        let sql = `
            SELECT 
                h.id as hafiz_id,
                h.nik,
                h.nama,
                h.kabupaten_kota,
                h.created_at as tanggal_daftar,
                h.status_kelulusan as status, -- Using status_kelulusan as registration status for now?
                -- Or maybe we need a separate pendaftaran table as per roadmap?
                -- Roadmap said: pendaftaran_periode (hafiz_id, periode_id, status, tanggal_daftar)
                -- But schema.sql doesn't have it yet.
                -- However, hafiz table has 'periode_tes_id'.
                -- So we assume registration is direct link in hafiz table.
                h.keterangan
            FROM hafiz h
            WHERE h.periode_tes_id = ?
        `;

        const queryParams: any[] = [id];

        // If admin_kabko, filter by region
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            sql += ' AND h.kabupaten_kota = ?';
            queryParams.push(user.kabupaten_kota);
        }

        sql += ' ORDER BY h.created_at DESC';

        const result = await query<any>(sql, queryParams);

        // Map result to match interface
        const data = result.map((row: any) => ({
            id: row.hafiz_id, // Using hafiz_id as pendaftaran id for now since 1-to-1 mapping in this schema
            hafiz_id: row.hafiz_id,
            nik: row.nik,
            nama: row.nama,
            kabupaten_kota: row.kabupaten_kota,
            tanggal_daftar: row.tanggal_daftar,
            status: row.status === 'lulus' ? 'diterima' : row.status === 'tidak_lulus' ? 'ditolak' : 'pending', // Mapping status
            keterangan: row.keterangan
        }));

        return NextResponse.json({ data });

    } catch (error) {
        console.error('Pendaftaran GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
