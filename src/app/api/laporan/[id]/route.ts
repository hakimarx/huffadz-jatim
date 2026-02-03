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

// PUT - Update laporan (approve/reject for admin, edit for hafiz)
export async function PUT(request: NextRequest, context: Context) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await request.json();

        // Build update fields dynamically
        const updateFields: string[] = [];
        const params: unknown[] = [];

        // For hafiz, they can only update their own reports and limited fields
        if (user.role === 'hafiz') {
            // Verify this laporan belongs to the hafiz
            const hafiz = await queryOne<{ id: number }>('SELECT id FROM hafiz WHERE user_id = ?', [user.id]);
            if (!hafiz) {
                return NextResponse.json({ error: 'Profil hafiz tidak ditemukan' }, { status: 404 });
            }

            const laporan = await queryOne<{ hafiz_id: number, status_verifikasi: string }>(
                'SELECT hafiz_id, status_verifikasi FROM laporan_harian WHERE id = ?',
                [id]
            );

            if (!laporan) {
                return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
            }

            if (laporan.hafiz_id !== hafiz.id) {
                return NextResponse.json({ error: 'Anda tidak memiliki akses ke laporan ini' }, { status: 403 });
            }

            // Hafiz can only edit pending or rejected reports
            if (laporan.status_verifikasi === 'disetujui') {
                return NextResponse.json({ error: 'Laporan yang sudah disetujui tidak dapat diedit' }, { status: 400 });
            }

            // Allowed fields for hafiz
            if (data.tanggal !== undefined) {
                updateFields.push('tanggal = ?');
                params.push(data.tanggal);
            }
            if (data.jam !== undefined) {
                updateFields.push('jam = ?');
                params.push(data.jam);
            }
            if (data.jenis_kegiatan !== undefined) {
                updateFields.push('jenis_kegiatan = ?');
                params.push(data.jenis_kegiatan);
            }
            if (data.deskripsi !== undefined) {
                updateFields.push('deskripsi = ?');
                params.push(data.deskripsi);
            }
            if (data.lokasi !== undefined) {
                updateFields.push('lokasi = ?');
                params.push(data.lokasi);
            }
            if (data.foto_url !== undefined) {
                updateFields.push('foto = ?');
                params.push(data.foto_url);
            }
            // Reset status to pending when hafiz edits
            if (data.status_verifikasi !== undefined) {
                updateFields.push('status_verifikasi = ?');
                params.push(data.status_verifikasi);
            }
        } else {
            // Admin can update verification status
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
