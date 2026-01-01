import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get single jadwal
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);
        if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const jadwal = await queryOne<any>(
            `SELECT j.*, p.nama_periode, p.tahun 
             FROM jadwal_tes j
             JOIN periode_tes p ON j.periode_tes_id = p.id
             WHERE j.id = ?`,
            [id]
        );

        if (!jadwal) {
            return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ data: jadwal });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT - Update jadwal
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi']);
        if (!authenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        await execute(
            `UPDATE jadwal_tes SET 
                periode_tes_id = ?, kabupaten_kota = ?, tanggal_tes = ?,
                waktu_mulai = ?, waktu_selesai = ?, lokasi = ?,
                alamat_lengkap = ?, kapasitas = ?
             WHERE id = ?`,
            [
                body.periode_tes_id, body.kabupaten_kota, body.tanggal_tes,
                body.waktu_mulai, body.waktu_selesai, body.lokasi,
                body.alamat_lengkap, body.kapasitas, id
            ]
        );

        return NextResponse.json({ success: true, message: 'Jadwal updated' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE - Delete jadwal
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi']);
        if (!authenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await execute('DELETE FROM jadwal_tes WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Jadwal deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
