import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface DBPenguji {
    id: number;
    nama: string;
    gelar?: string;
    institusi?: string;
    telepon?: string;
    email?: string;
    lokasi_tes?: string;
    periode_tes?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

// GET - List all penguji
export async function GET() {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const pengujiList = await query<DBPenguji>(
            'SELECT * FROM penguji ORDER BY nama ASC'
        );

        return NextResponse.json({ data: pengujiList });
    } catch (error) {
        console.error('Penguji GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new penguji (admin provinsi only)
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.nama) {
            return NextResponse.json(
                { error: 'Nama penguji wajib diisi' },
                { status: 400 }
            );
        }

        const insertId = await insert(
            `INSERT INTO penguji (nama, gelar, institusi, telepon, email, lokasi_tes, periode_tes, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nama,
                data.gelar || null,
                data.institusi || null,
                data.telepon || null,
                data.email || null,
                data.lokasi_tes || null,
                data.periode_tes || null,
                data.is_active !== false ? 1 : 0
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Penguji berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Penguji POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update penguji (admin provinsi only)
export async function PUT(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: 'ID penguji wajib diisi' },
                { status: 400 }
            );
        }

        await execute(
            `UPDATE penguji SET 
                nama = ?,
                gelar = ?,
                institusi = ?,
                telepon = ?,
                email = ?,
                lokasi_tes = ?,
                periode_tes = ?,
                is_active = ?,
                updated_at = NOW()
            WHERE id = ?`,
            [
                data.nama,
                data.gelar || null,
                data.institusi || null,
                data.telepon || null,
                data.email || null,
                data.lokasi_tes || null,
                data.periode_tes || null,
                data.is_active ? 1 : 0,
                data.id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Penguji berhasil diupdate',
        });
    } catch (error) {
        console.error('Penguji PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete penguji (admin provinsi only)
export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID penguji wajib diisi' },
                { status: 400 }
            );
        }

        await execute('DELETE FROM penguji WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Penguji berhasil dihapus',
        });
    } catch (error) {
        console.error('Penguji DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
