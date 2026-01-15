import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Running DB migration: Add telepon column');

        try {
            await execute("ALTER TABLE users ADD COLUMN telepon VARCHAR(20) AFTER kabupaten_kota");
            return NextResponse.json({ success: true, message: "Column 'telepon' added successfully." });
        } catch (err: any) {
            if (err.message && err.message.includes("Duplicate column name")) {
                return NextResponse.json({ success: true, message: "Column 'telepon' already exists." });
            }
            throw err;
        }
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
