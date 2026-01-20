const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('📧 Mencoba mengirim email test...');
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? 'Terdeteksi (re_...)' : 'TIDAK DITEMUKAN');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Error: API Key belum disetting di .env.local');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Huffadz Jatim <onboarding@resend.dev>',
            to: ['hakimarx@gmail.com'], // Email tujuan (harus sama dengan akun Resend)
            subject: 'Test Email dari Huffadz Jatim',
            html: '<strong>Berhasil!</strong> Email ini dikirim dari aplikasi Huffadz Jatim.',
        });

        if (error) {
            console.error('❌ Gagal mengirim email:', error);
        } else {
            console.log('✅ Email TERKIRIM!', data);
            console.log('👉 Silakan cek inbox/spam hakim.luk81@gmail.com sekarang.');
        }
    } catch (err) {
        console.error('❌ Terjadi error sistem:', err);
    }
}

testEmail();
