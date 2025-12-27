import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get single periode tes
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { id } = await params;

        const periode = await queryOne<any>(
            'SELECT * FROM periode_tes WHERE id = ?',
            [id]
        );

        if (!periode) {
            return NextResponse.json(
                { error: 'Periode tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: periode });
    } catch (error) {
        console.error('Periode GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update periode tes (admin provinsi only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Check if periode exists
        const existing = await queryOne<any>(
            'SELECT id FROM periode_tes WHERE id = ?',
            [id]
        );

        if (!existing) {
            return NextResponse.json(
                { error: 'Periode tidak ditemukan' },
                { status: 404 }
            );
        }

        // Update periode
        await execute(
            `UPDATE periode_tes SET 
                tahun = ?,
                nama_periode = ?,
                tanggal_mulai = ?,
                tanggal_selesai = ?,
                kuota_total = ?,
                status = ?,
                deskripsi = ?,
                updated_at = NOW()
            WHERE id = ?`,
            [
                data.tahun,
                data.nama_periode,
                data.tanggal_mulai,
                data.tanggal_selesai,
                data.kuota_total || 1000,
                data.status || 'draft',
                data.deskripsi || null,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Periode tes berhasil diupdate',
        });
    } catch (error) {
        console.error('Periode PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete periode tes (admin provinsi only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await params;

        // Check if periode exists
        const existing = await queryOne<any>(
            'SELECT id FROM periode_tes WHERE id = ?',
            [id]
        );

        if (!existing) {
            return NextResponse.json(
                { error: 'Periode tidak ditemukan' },
                { status: 404 }
            );
        }

        // Delete periode
        await execute('DELETE FROM periode_tes WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Periode tes berhasil dihapus',
        });
    } catch (error) {
        console.error('Periode DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
