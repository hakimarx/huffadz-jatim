import { NextResponse } from 'next/server';
import { query, DBKabupatenKota } from '@/lib/db';

// GET - List all kabupaten/kota
export async function GET() {
    try {
        const kabupatenList = await query<DBKabupatenKota>(
            'SELECT * FROM kabupaten_kota ORDER BY nama ASC'
        );

        return NextResponse.json({ data: kabupatenList });
    } catch (error) {
        console.error('Kabupaten GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
