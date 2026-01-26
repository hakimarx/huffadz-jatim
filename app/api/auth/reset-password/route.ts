import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token dan password harus diisi' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
        }

        // Find user with valid token
        const users = await query(
            'SELECT id, email, nama FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        ) as any[];

        if (users.length === 0) {
            return NextResponse.json({
                error: 'Link reset password tidak valid atau sudah kadaluarsa. Silakan request ulang.'
            }, { status: 400 });
        }

        const user = users[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset. Silakan login dengan password baru Anda.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 });
    }
}

// GET endpoint to verify token is still valid
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ valid: false, error: 'Token tidak ditemukan' }, { status: 400 });
        }

        const users = await query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        ) as any[];

        if (users.length === 0) {
            return NextResponse.json({
                valid: false,
                error: 'Link reset password tidak valid atau sudah kadaluarsa.'
            });
        }

        return NextResponse.json({ valid: true });

    } catch (error) {
        console.error('Verify reset token error:', error);
        return NextResponse.json({ valid: false, error: 'Terjadi kesalahan' }, { status: 500 });
    }
}
