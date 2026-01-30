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
        const crypto = await import('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert user
        const userId = await insert(
            `INSERT INTO users (email, password, nama, role, telepon, kabupaten_kota, is_active, is_verified, verification_token, created_at, updated_at) 
             VALUES (?, ?, ?, 'hafiz', ?, ?, 0, 0, ?, NOW(), NOW())`,
            [email, hashedPassword, nama, telepon || null, kabupaten_kota || null, verificationToken]
        );

        // Insert hafiz profile
        await insert(
            `INSERT INTO hafiz (user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, 
             desa_kelurahan, kecamatan, kabupaten_kota, telepon, tahun_tes, status_kelulusan, is_aktif, created_at, updated_at) 
             VALUES (?, ?, ?, '-', '2000-01-01', 'L', '-', '-', '-', ?, ?, ?, 'pending', 1, NOW(), NOW())`,
            [userId, nik, nama, kabupaten_kota || 'Jawa Timur', telepon || null, new Date().getFullYear()]
        );

        // Send welcome email - Wrap in try-catch to avoid blocking registration if email fails
        try {
            const { sendEmail } = await import('@/lib/mail');
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://hafizjatim.my.id';
            const verifyUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

            await sendEmail({
                to: email,
                subject: 'Verifikasi Akun LPTQ Jatim',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                        <h2 style="color: #10b981; text-align: center;">Selamat Datang di LPTQ Jatim</h2>
                        <p>Halo <strong>${nama}</strong>,</p>
                        <p>Terima kasih telah mendaftar di sistem Huffadz Jawa Timur. Sedikit lagi akun Anda akan siap digunakan sepenuhnya.</p>
                        <p>Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Verifikasi Email</a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">Atau salin link berikut ke browser Anda:</p>
                        <p style="color: #6b7280; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Jika Anda tidak merasa mendaftar, silakan abaikan email ini.</p>
                    </div>
                `
            });
        } catch (mailError: any) {
            console.error('Failed to send welcome email:', mailError);
        }

        // Send WhatsApp notification
        if (telepon) {
            try {
                const { sendWhatsAppMessage } = await import('@/lib/wa');
                const waMessage = `Assalamualaikum ${nama}, terima kasih telah mendaftar di LPTQ Jatim. Akun Anda telah dibuat. Silakan cek email Anda (${email}) untuk melakukan verifikasi akun.`;
                sendWhatsAppMessage(telepon, waMessage).catch((e) => console.error('WA async error:', e));
            } catch (waError) {
                console.error('WA Notification error:', waError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            userId,
            requiresVerification: true
        });
    } catch (error: any) {
        console.error('Registration error detail:', {
            message: error.message,
            code: error.code,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });

        // Handle duplicate key errors
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('email')) {
                return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
            }
            if (error.message.includes('nik')) {
                return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
            }
        }

        // Return more specific error in dev or clearer general error in prod
        const errorMessage = error.sqlMessage
            ? `Database Error: ${error.sqlMessage}`
            : (error.message || 'Terjadi kesalahan server saat registrasi');

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.message,
                code: error.code
            },
            { status: 500 }
        );
    }
}
