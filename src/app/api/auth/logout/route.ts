import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST() {
    try {
        await logoutUser();
        const response = NextResponse.json({ success: true });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
    } catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
