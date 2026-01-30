import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface KBSetting {
    key: string;
    value: string;
    description: string;
}

// GET - List all settings
export async function GET() {
    try {
        const settings = await query<KBSetting>('SELECT * FROM settings');
        const settingsMap: Record<string, string> = {};

        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json({ data: settingsMap });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Update settings (Admin Provinsi only)
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Data is expected to be { key: value, ... }
        const updates = Object.entries(data);

        for (const [key, value] of updates) {
            // Check if setting exists
            const exists = await query('SELECT `key` FROM settings WHERE `key` = ?', [key]);

            if (exists.length > 0) {
                await execute(
                    'UPDATE settings SET value = ? WHERE `key` = ?',
                    [value, key]
                );
            } else {
                await execute(
                    'INSERT INTO settings (`key`, `value`) VALUES (?, ?)',
                    [key, value]
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Pengaturan berhasil disimpan'
        });

    } catch (error) {
        console.error('Settings POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
