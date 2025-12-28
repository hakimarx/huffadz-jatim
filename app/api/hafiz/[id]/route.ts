import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, DBHafiz } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Get single hafiz by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await params;

        const hafiz = await queryOne<DBHafiz>(
            'SELECT * FROM hafiz WHERE id = ?',
            [id]
        );

        if (hafiz) {
            const history = await query(
                'SELECT * FROM riwayat_mengajar WHERE hafiz_id = ? ORDER BY tmt_mulai DESC',
                [id]
            );
            (hafiz as any).riwayat_mengajar = history;
        }

        if (!hafiz) {
            return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
        }

        // Admin kabko can only view hafiz in their region
        if (user.role === 'admin_kabko' && hafiz.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ data: hafiz });
    } catch (error) {
        console.error('Hafiz GET by ID error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update hafiz
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Check if hafiz exists
        const hafiz = await queryOne<DBHafiz>(
            'SELECT * FROM hafiz WHERE id = ?',
            [id]
        );

        if (!hafiz) {
            return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
        }

        // Admin kabko can only edit hafiz in their region
        if (user.role === 'admin_kabko' && hafiz.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Hafiz can only edit their own profile
        if (user.role === 'hafiz' && hafiz.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: unknown[] = [];

        const allowedFields = [
            'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'alamat',
            'rt', 'rw', 'desa_kelurahan', 'kecamatan', 'telepon', 'email',
            'sertifikat_tahfidz', 'mengajar', 'tmt_mengajar', 'tempat_mengajar',
            'tempat_mengajar_2', 'tmt_mengajar_2', 'status_kelulusan', 'nilai_tahfidz',
            'nilai_wawasan', 'nomor_piagam', 'tanggal_lulus', 'status_insentif', 'keterangan'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'Tidak ada data untuk diupdate' }, { status: 400 });
        }

        values.push(id);

        await execute(
            `UPDATE hafiz SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({
            success: true,
            message: 'Hafiz berhasil diupdate',
        });
    } catch (error) {
        console.error('Hafiz PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete hafiz
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { id } = await params;

        const affected = await execute('DELETE FROM hafiz WHERE id = ?', [id]);

        if (affected === 0) {
            return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Hafiz berhasil dihapus',
        });
    } catch (error) {
        console.error('Hafiz DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
