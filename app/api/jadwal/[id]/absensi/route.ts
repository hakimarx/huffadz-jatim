import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get list of participants and their attendance status
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

        // 2. Get Hafiz in this region & periode, joined with absensi
        // We assume all hafiz in this region for this periode are participants
        const participants = await query<any>(
            `SELECT 
                h.id as hafiz_id,
                h.nik,
                h.nama,
                h.kabupaten_kota,
                h.foto_profil,
                a.hadir,
                a.waktu_absen,
                a.catatan
             FROM hafiz h
             LEFT JOIN absensi_tes a ON h.id = a.hafiz_id AND a.jadwal_tes_id = ?
             WHERE h.periode_tes_id = ? AND h.kabupaten_kota = ?
             ORDER BY h.nama ASC`,
            [id, jadwal.periode_tes_id, jadwal.kabupaten_kota]
        );

        return NextResponse.json({ data: participants });
    } catch (error) {
        console.error('Absensi GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST - Mark attendance (Check-in)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated } = await requireAuth(['admin_provinsi', 'admin_kabko']);
        if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { hafiz_id, nik, catatan } = body;

        if (!hafiz_id && !nik) {
            return NextResponse.json({ error: 'Hafiz ID or NIK required' }, { status: 400 });
        }

        // Find Hafiz ID if only NIK provided
        let targetHafizId = hafiz_id;
        if (!targetHafizId && nik) {
            const hafiz = await queryOne<any>('SELECT id FROM hafiz WHERE nik = ?', [nik]);
            if (!hafiz) return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
            targetHafizId = hafiz.id;
        }

        // Check if already present
        const existing = await queryOne<any>(
            'SELECT id FROM absensi_tes WHERE jadwal_tes_id = ? AND hafiz_id = ?',
            [id, targetHafizId]
        );

        if (existing) {
            // Update
            await execute(
                'UPDATE absensi_tes SET hadir = true, waktu_absen = NOW(), catatan = ? WHERE id = ?',
                [catatan || null, existing.id]
            );
        } else {
            // Insert
            await execute(
                'INSERT INTO absensi_tes (jadwal_tes_id, hafiz_id, hadir, waktu_absen, catatan) VALUES (?, ?, true, NOW(), ?)',
                [id, targetHafizId, catatan || null]
            );
        }

        return NextResponse.json({ success: true, message: 'Absensi berhasil dicatat' });
    } catch (error) {
        console.error('Absensi POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
