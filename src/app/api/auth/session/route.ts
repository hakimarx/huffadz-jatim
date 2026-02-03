import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            const errorResponse = NextResponse.json(
                { error: 'Unauthorized', message: 'No active session found' },
                { status: 401 }
            );
            errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            return errorResponse;
        }

        const response = NextResponse.json({ user });

        // Disable caching for session data to prevent stale role issues
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error: any) {
        console.error('Session API error:', error);
        return NextResponse.json(
            {
                error: 'Terjadi kesalahan server',
                details: error?.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
