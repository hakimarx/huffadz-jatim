/**
 * Utility for sending emails.
 * For now, it just logs the email to the console/file as a mock.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html}`);
    console.log('-----------------------');

    // In a real app, you would use nodemailer or an API here.
    return { success: true };
}

export function generateVerificationToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
