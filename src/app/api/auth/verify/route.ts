import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';

interface VerifyUser {
    id: number;
    nama: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
        }

        // Find user with this token
        const user = await queryOne<VerifyUser>(
            'SELECT id, nama FROM users WHERE verification_token = ?',
            [token]
        );

        if (!user) {
            return NextResponse.json({ error: 'Token tidak ditemukan atau sudah kadaluarsa' }, { status: 400 });
        }

        // Update user to verified and active
        await execute(
            'UPDATE users SET is_verified = 1, is_active = 1, verification_token = NULL WHERE id = ?',
            [user.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Email berhasil diverifikasi. Silakan login.',
            nama: user.nama
        });
    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server saat verifikasi' },
            { status: 500 }
        );
    }
}
