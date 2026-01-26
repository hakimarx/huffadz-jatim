import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail, generateVerificationToken } from '@/lib/mail';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email harus diisi' }, { status: 400 });
        }

        // Check if user exists
        const users = await query('SELECT id, email, nama FROM users WHERE email = ?', [email]) as any[];
        
        if (users.length === 0) {
            // Return success even if email not found (security best practice)
            return NextResponse.json({ 
                success: true, 
                message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.' 
            });
        }

        const user = users[0];
        
        // Generate reset token
        const resetToken = generateVerificationToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save token to database
        await query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, resetExpires, user.id]
        );

        // Create reset link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

        // Send email
        await sendEmail({
            to: email,
            subject: 'Reset Password - Huffadz Jatim',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Huffadz Jatim</h1>
                        <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">LPTQ Jawa Timur</p>
                    </div>
                    <div style="background: #fff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
                        <h2 style="color: #1f2937; margin-top: 0;">Halo, ${user.nama}!</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Kami menerima permintaan untuk mereset password akun Anda. 
                            Klik tombol di bawah ini untuk membuat password baru:
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" 
                               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                      color: white; 
                                      padding: 16px 32px; 
                                      border-radius: 12px; 
                                      text-decoration: none; 
                                      font-weight: bold;
                                      display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            Link ini akan kadaluarsa dalam <strong>1 jam</strong>.
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            Jika Anda tidak meminta reset password, abaikan email ini.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                            Jika tombol tidak berfungsi, salin dan tempel link berikut di browser Anda:<br/>
                            <a href="${resetLink}" style="color: #10b981; word-break: break-all;">${resetLink}</a>
                        </p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.' 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 });
    }
}
