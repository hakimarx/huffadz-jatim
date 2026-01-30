import { NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { execute, queryOne, DBUser } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Anda harus login untuk mengubah password' },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Password lama dan password baru wajib diisi' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Password baru minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Fetch user with password
        const dbUser = await queryOne<DBUser>(
            'SELECT password FROM users WHERE id = ?',
            [user.id]
        );

        if (!dbUser) {
            return NextResponse.json(
                { error: 'Not Found', message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, dbUser.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Password lama salah' },
                { status: 401 }
            );
        }

        // Hash and update password
        const hashedNewPassword = await hashPassword(newPassword);
        const updatedRows = await execute(
            "UPDATE users SET password = ?, status = 'active', updated_at = NOW() WHERE id = ?",
            [hashedNewPassword, user.id]
        );

        if (updatedRows === 0) {
            throw new Error('Gagal memperbarui password di database');
        }

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diperbarui'
        });

    } catch (error: any) {
        console.error('Change Password API error:', error);
        return NextResponse.json(
            {
                error: 'Terjadi kesalahan server',
                details: error?.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
