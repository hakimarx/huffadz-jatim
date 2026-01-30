import { NextRequest, NextResponse } from 'next/server';
import { query, insert, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST - Add teaching history
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        if (!data.hafiz_id || !data.tempat_mengajar) {
            return NextResponse.json(
                { error: 'Data tidak lengkap' },
                { status: 400 }
            );
        }

        // Verify ownership
        if (user.role === 'admin_kabko' || user.role === 'hafiz') {
            const hafiz = await query(
                'SELECT id, kabupaten_kota, user_id FROM hafiz WHERE id = ?',
                [data.hafiz_id]
            );

            const h = hafiz[0] as any;
            if (!h) return NextResponse.json({ error: 'Hafiz not found' }, { status: 404 });

            if (user.role === 'admin_kabko' && h.kabupaten_kota !== user.kabupaten_kota) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            if (user.role === 'hafiz' && h.user_id !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const insertId = await insert(
            `INSERT INTO riwayat_mengajar (hafiz_id, tempat_mengajar, tmt_mulai, tmt_selesai, keterangan)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.hafiz_id,
                data.tempat_mengajar,
                data.tmt_mulai || null,
                data.tmt_selesai || null,
                data.keterangan || null
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Riwayat mengajar berhasil ditambahkan',
        });
    } catch (error) {
        console.error('History POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// DELETE - Remove teaching history
export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID Required' }, { status: 400 });
        }

        // Verify ownership for history item
        if (user.role === 'admin_kabko' || user.role === 'hafiz') {
            // Join to check hafiz kabko and user_id
            const check = await query(
                `SELECT h.kabupaten_kota, h.user_id
                 FROM riwayat_mengajar rm
                 JOIN hafiz h ON rm.hafiz_id = h.id
                 WHERE rm.id = ?`,
                [id]
            );
            const c = check[0] as any;
            if (!c) return NextResponse.json({ error: 'History not found' }, { status: 404 });

            if (user.role === 'admin_kabko' && c.kabupaten_kota !== user.kabupaten_kota) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            if (user.role === 'hafiz' && c.user_id !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        await execute('DELETE FROM riwayat_mengajar WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Riwayat berhasil dihapus'
        });
    } catch (error) {
        console.error('History DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
