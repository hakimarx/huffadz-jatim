import { NextResponse } from 'next/server';
import { getWhatsAppQR } from '@/lib/wa';

export async function GET() {
    const qr = await getWhatsAppQR();
    if (!qr) return NextResponse.json({ error: 'QR not ready' }, { status: 404 });
    return NextResponse.json({ qr });
}
