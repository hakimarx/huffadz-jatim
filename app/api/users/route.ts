import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute, DBUser } from '@/lib/db';
import { requireAuth, hashPassword, registerUser } from '@/lib/auth';

// GET - List users (admin only)
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role') || '';
        const search = searchParams.get('search') || '';

        let whereClause = 'is_active = 1';
        const params: unknown[] = [];

        // Admin kabko can only see users in their region
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            whereClause += ' AND kabupaten_kota = ?';
            params.push(user.kabupaten_kota);
        }

        if (role) {
            whereClause += ' AND role = ?';
            params.push(role);
        }

        if (search) {
            whereClause += ' AND (email LIKE ? OR nama LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const users = await query<Omit<DBUser, 'password'>>(
            `SELECT id, email, role, nama, kabupaten_kota, telepon, is_active, created_at, updated_at 
       FROM users WHERE ${whereClause} ORDER BY nama ASC`,
            params
        );

        return NextResponse.json({ data: users });
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.email || !data.password || !data.nama || !data.role) {
            return NextResponse.json(
                { error: 'Email, password, nama, dan role wajib diisi' },
                { status: 400 }
            );
        }

        // Validate NIK for hafiz role
        if (data.role === 'hafiz' && !data.nik) {
            return NextResponse.json(
                { error: 'NIK wajib diisi untuk akun hafiz' },
                { status: 400 }
            );
        }

        // Validate role permissions
        if (user.role === 'admin_kabko') {
            // Admin kabko can only create hafiz users in their region
            if (data.role !== 'hafiz') {
                return NextResponse.json(
                    { error: 'Anda hanya dapat membuat akun hafiz' },
                    { status: 403 }
                );
            }
            if (data.kabupaten_kota !== user.kabupaten_kota) {
                return NextResponse.json(
                    { error: 'Anda hanya dapat membuat akun di wilayah Anda' },
                    { status: 403 }
                );
            }
        }

        const result = await registerUser(
            data.email,
            data.password,
            data.nama,
            data.role,
            data.kabupaten_kota,
            data.nik,
            data.telepon
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            id: result.userId,
            message: 'User berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Users POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: 'ID user wajib diisi' },
                { status: 400 }
            );
        }

        // Admin kabko can only update users in their region
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            const targetUser = await queryOne<{ kabupaten_kota: string }>(
                'SELECT kabupaten_kota FROM users WHERE id = ?',
                [data.id]
            );
            if (targetUser && targetUser.kabupaten_kota !== user.kabupaten_kota) {
                return NextResponse.json(
                    { error: 'Anda hanya dapat mengubah user di wilayah Anda' },
                    { status: 403 }
                );
            }
        }

        await execute(
            `UPDATE users SET 
                nama = ?,
                kabupaten_kota = ?,
                telepon = ?,
                updated_at = NOW()
            WHERE id = ?`,
            [
                data.nama,
                data.kabupaten_kota,
                data.telepon || null,
                data.id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'User berhasil diupdate'
        });
    } catch (error) {
        console.error('Users PUT error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID user wajib diisi' },
                { status: 400 }
            );
        }

        // Admin kabko can only delete users in their region
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            const targetUser = await queryOne<{ kabupaten_kota: string }>(
                'SELECT kabupaten_kota FROM users WHERE id = ?',
                [id]
            );
            if (targetUser && targetUser.kabupaten_kota !== user.kabupaten_kota) {
                return NextResponse.json(
                    { error: 'Anda hanya dapat menghapus user di wilayah Anda' },
                    { status: 403 }
                );
            }
        }

        // Soft-delete user to avoid accidental data loss and to keep referential integrity.
        // Also unlink any hafiz profiles attached to this user.
        await execute('UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
        await execute('UPDATE hafiz SET user_id = NULL WHERE user_id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'User berhasil dinonaktifkan dan profil hafiz terlepas'
        });
    } catch (error) {
        console.error('Users DELETE error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
