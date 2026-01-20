import { Resend } from 'resend';

/**
 * Utility for sending emails using Resend API.
 * Falls back to console logging if RESEND_API_KEY is not configured.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const apiKey = process.env.RESEND_API_KEY;

    // If no API key, log to console (development mode)
    if (!apiKey || apiKey === 'your-resend-api-key-here') {
        console.log('⚠️  RESEND_API_KEY not configured. Email logged to console:');
        console.log('--- EMAIL DETAILS ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${html}`);
        console.log('--------------------');
        return { success: true, mode: 'console' };
    }

    try {
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'Huffadz Jatim <onboarding@resend.dev>', // Use verified domain in production
            to,
            subject,
            html,
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            return { success: false, error };
        }

        console.log('✅ Email sent successfully:', data?.id);
        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error };
    }
}

export function generateVerificationToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
