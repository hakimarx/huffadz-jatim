import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Context {
    params: Promise<{ id: string }>;
}

// GET - Get single laporan by ID
export async function GET(request: NextRequest, context: Context) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await context.params;

        const laporan = await queryOne(
            `SELECT lh.*, h.nama as hafiz_nama, h.kabupaten_kota as hafiz_kabupaten_kota
             FROM laporan_harian lh
             LEFT JOIN hafiz h ON lh.hafiz_id = h.id
             WHERE lh.id = ?`,
            [id]
        );

        if (!laporan) {
            return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ data: laporan });
    } catch (error) {
        console.error('Laporan GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update laporan (approve/reject)
export async function PUT(request: NextRequest, context: Context) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await request.json();

        // Build update fields dynamically
        const updateFields: string[] = [];
        const params: unknown[] = [];

        if (data.status_verifikasi) {
            updateFields.push('status_verifikasi = ?');
            params.push(data.status_verifikasi);
        }

        if (data.verified_by !== undefined) {
            updateFields.push('verified_by = ?');
            params.push(data.verified_by);
        }

        if (data.verified_at !== undefined) {
            updateFields.push('verified_at = ?');
            params.push(data.verified_at);
        }

        if (data.catatan_verifikasi !== undefined) {
            updateFields.push('catatan_verifikasi = ?');
            params.push(data.catatan_verifikasi);
        }

        updateFields.push('updated_at = NOW()');
        params.push(id);

        if (updateFields.length === 1) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        await execute(
            `UPDATE laporan_harian SET ${updateFields.join(', ')} WHERE id = ?`,
            params
        );

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil diupdate'
        });
    } catch (error) {
        console.error('Laporan PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete laporan
export async function DELETE(request: NextRequest, context: Context) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await context.params;

        await execute('DELETE FROM laporan_harian WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil dihapus'
        });
    } catch (error) {
        console.error('Laporan DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
