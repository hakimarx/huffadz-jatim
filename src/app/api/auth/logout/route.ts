import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST() {
    try {
        await logoutUser();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
