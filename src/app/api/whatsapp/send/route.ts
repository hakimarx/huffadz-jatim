import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/wa';

export async function POST(req: NextRequest) {
    const { number, message } = await req.json();
    const result = await sendWhatsAppMessage(number, message);
    return NextResponse.json(result);
}
