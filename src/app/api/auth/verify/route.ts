import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/login?error=Invalid token', request.url));
    }

    try {
        // Find user with this token
        const user = await queryOne<{ id: number; email: string }>(
            'SELECT id, email FROM users WHERE verification_token = ?',
            [token]
        );

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=Token tidak valid atau sudah kadaluarsa', request.url));
        }

        // Verify user and clear token
        await execute(
            'UPDATE users SET is_verified = 1, is_active = 1, verification_token = NULL WHERE id = ?',
            [user.id]
        );

        // Redirect to login with success message
        return NextResponse.redirect(new URL('/login?verified=true', request.url));
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.redirect(new URL('/login?error=Terjadi kesalahan saat verifikasi', request.url));
    }
}
