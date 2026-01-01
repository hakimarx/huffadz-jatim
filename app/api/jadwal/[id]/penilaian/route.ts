import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get list of participants for grading
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated } = await requireAuth(['admin_provinsi', 'admin_kabko']);
        if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // 1. Get Jadwal Details
        const jadwal = await queryOne<any>(
            'SELECT periode_tes_id, kabupaten_kota FROM jadwal_tes WHERE id = ?',
            [id]
        );

        if (!jadwal) {
            return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
        }

        // 2. Get Hafiz in this region & periode
        // We include attendance info to highlight those who were present
        const participants = await query<any>(
            `SELECT 
                h.id as hafiz_id,
                h.nik,
                h.nama,
                h.kabupaten_kota,
                h.nilai_tahfidz,
                h.nilai_wawasan,
                h.status_kelulusan,
                a.hadir
             FROM hafiz h
             LEFT JOIN absensi_tes a ON h.id = a.hafiz_id AND a.jadwal_tes_id = ?
             WHERE h.periode_tes_id = ? AND h.kabupaten_kota = ?
             ORDER BY h.nama ASC`,
            [id, jadwal.periode_tes_id, jadwal.kabupaten_kota]
        );

        return NextResponse.json({ data: participants });
    } catch (error) {
        console.error('Penilaian GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST - Update scores
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated } = await requireAuth(['admin_provinsi', 'admin_kabko']);
        if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { hafiz_id, nilai_tahfidz, nilai_wawasan } = body;

        if (!hafiz_id) {
            return NextResponse.json({ error: 'Hafiz ID required' }, { status: 400 });
        }

        // Calculate status based on scores (Simple logic for now)
        // Example: passing if average > 70
        const t = parseFloat(nilai_tahfidz) || 0;
        const w = parseFloat(nilai_wawasan) || 0;
        // Logic can be refined later
        // For now just save scores. Status update might be separate or auto.

        await execute(
            'UPDATE hafiz SET nilai_tahfidz = ?, nilai_wawasan = ?, updated_at = NOW() WHERE id = ?',
            [t, w, hafiz_id]
        );

        return NextResponse.json({ success: true, message: 'Nilai berhasil disimpan' });
    } catch (error) {
        console.error('Penilaian POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
