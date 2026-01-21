import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppBroadcast } from '@/lib/wa';

export async function POST(req: NextRequest) {
    const { numbers, message } = await req.json();
    const result = await sendWhatsAppBroadcast(numbers, message);
    return NextResponse.json(result);
}
