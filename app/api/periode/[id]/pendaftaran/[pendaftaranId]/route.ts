import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
    pendaftaranId: string;
}

// PUT - Update status pendaftaran
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pendaftaranId } = await params;
        const body = await request.json();
        const { status } = body; // 'diterima' | 'ditolak'

        // Map UI status to DB status
        // UI: diterima -> DB: lulus (Temporary mapping, ideally should be separate status)
        // UI: ditolak -> DB: tidak_lulus
        let dbStatus = 'pending';
        if (status === 'diterima') dbStatus = 'lulus';
        if (status === 'ditolak') dbStatus = 'tidak_lulus';

        // Check permissions
        // Admin Kabko can only update their own region? 
        // Usually approval is done by Admin Provinsi or specific verifier.
        // For now allow both.

        await execute(
            'UPDATE hafiz SET status_kelulusan = ?, updated_at = NOW() WHERE id = ?',
            [dbStatus, pendaftaranId]
        );

        return NextResponse.json({
            success: true,
            message: 'Status berhasil diupdate'
        });

    } catch (error) {
        console.error('Pendaftaran PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
