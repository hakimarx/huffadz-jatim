import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, DBUser, DBHafiz } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { email, password, nama, nik, telepon, kabupaten_kota } = data;

        // Validate required fields
        if (!email || !password || !nama || !nik) {
            return NextResponse.json(
                { error: 'Email, password, nama, dan NIK wajib diisi' },
                { status: 400 }
            );
        }

        if (nik.length !== 16) {
            return NextResponse.json(
                { error: 'NIK harus 16 digit' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await queryOne<DBUser>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email sudah terdaftar' },
                { status: 400 }
            );
        }

        // Check if NIK already exists in hafiz table
        const existingHafiz = await queryOne<DBHafiz>(
            'SELECT id FROM hafiz WHERE nik = ?',
            [nik]
        );

        if (existingHafiz) {
            return NextResponse.json(
                { error: 'NIK sudah terdaftar' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const userId = await insert(
            `INSERT INTO users (email, password, nama, role, telepon, kabupaten_kota, is_active) 
             VALUES (?, ?, ?, 'hafiz', ?, ?, 1)`,
            [email, hashedPassword, nama, telepon || null, kabupaten_kota || null]
        );

        // Insert hafiz profile
        await insert(
            `INSERT INTO hafiz (user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, 
             desa_kelurahan, kecamatan, kabupaten_kota, telepon, tahun_tes, status_kelulusan) 
             VALUES (?, ?, ?, '-', '2000-01-01', 'L', '-', '-', '-', ?, ?, ?, 'pending')`,
            [userId, nik, nama, kabupaten_kota || 'Jawa Timur', telepon || null, new Date().getFullYear()]
        );

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil. Silakan login.',
            userId
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle duplicate key errors
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('email')) {
                return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
            }
            if (error.message.includes('nik')) {
                return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: 'Terjadi kesalahan server saat registrasi' },
            { status: 500 }
        );
    }
}
