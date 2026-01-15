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

        // Generate verification token
        const { generateVerificationToken, sendEmail } = await import('@/lib/mail');
        const verificationToken = generateVerificationToken();

        // Insert user (set is_active = 0 and is_verified = 0)
        const userId = await insert(
            `INSERT INTO users (email, password, nama, role, telepon, kabupaten_kota, is_active, is_verified, verification_token) 
             VALUES (?, ?, ?, 'hafiz', ?, ?, 0, 0, ?)`,
            [email, hashedPassword, nama, telepon || null, kabupaten_kota || null, verificationToken]
        );

        // Insert hafiz profile
        await insert(
            `INSERT INTO hafiz (user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, 
             desa_kelurahan, kecamatan, kabupaten_kota, telepon, tahun_tes, status_kelulusan) 
             VALUES (?, ?, ?, '-', '2000-01-01', 'L', '-', '-', '-', ?, ?, ?, 'pending')`,
            [userId, nik, nama, kabupaten_kota || 'Jawa Timur', telepon || null, new Date().getFullYear()]
        );

        // Send verification email (mock)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;

        await sendEmail({
            to: email,
            subject: 'Verifikasi Email - LPTQ Jatim',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Selamat Datang di LPTQ Jatim</h2>
                    <p>Halo ${nama},</p>
                    <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi email Anda:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verifikasi Email</a>
                    <p>Atau klik link berikut: <br> <a href="${verificationLink}">${verificationLink}</a></p>
                    <p>Jika Anda tidak merasa mendaftar, silakan abaikan email ini.</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            userId,
            requiresVerification: true
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
