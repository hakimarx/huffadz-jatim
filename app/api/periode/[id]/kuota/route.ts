import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface Params {
    id: string;
}

// GET - Get kuota list for a periode
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi', 'admin_kabko']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // 1. Get all kabupaten/kota
        const kabupatenList = await query<any>(
            'SELECT nama FROM kabupaten_kota ORDER BY nama ASC'
        );

        // 2. Get existing kuota for this periode
        const kuotaList = await query<any>(
            'SELECT kabupaten_kota, kuota_diterima FROM kuota WHERE periode_tes_id = ?',
            [id]
        );

        // 3. Get usage stats (terpakai) from hafiz table
        // Count hafiz registered for this periode per kabupaten
        const usageStats = await query<any>(
            `SELECT kabupaten_kota, COUNT(*) as count 
             FROM hafiz 
             WHERE periode_tes_id = ? 
             GROUP BY kabupaten_kota`,
            [id]
        );

        // 4. Merge data
        const result = kabupatenList.map((kab: any) => {
            const kuota = kuotaList.find((k: any) => k.kabupaten_kota === kab.nama);
            const usage = usageStats.find((u: any) => u.kabupaten_kota === kab.nama);

            return {
                kabupaten_kota: kab.nama,
                kuota: kuota ? kuota.kuota_diterima : 0,
                terpakai: usage ? Number(usage.count) : 0
            };
        });

        // If user is admin_kabko, filter only their region
        if (user.role === 'admin_kabko' && user.kabupaten_kota) {
            const filtered = result.filter((r: any) => r.kabupaten_kota === user.kabupaten_kota);
            return NextResponse.json({ data: filtered });
        }

        return NextResponse.json({ data: result });

    } catch (error) {
        console.error('Kuota GET error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Update kuota (batch)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { authenticated, user } = await requireAuth(['admin_provinsi']);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { kuota } = body; // Array of { kabupaten_kota, kuota }

        if (!Array.isArray(kuota)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Use transaction if possible, but for now simple loop
        // MySQL doesn't support UPSERT easily without ON DUPLICATE KEY UPDATE
        // We will check if exists then update or insert

        for (const item of kuota) {
            const existing = await query<any>(
                'SELECT id FROM kuota WHERE periode_tes_id = ? AND kabupaten_kota = ?',
                [id, item.kabupaten_kota]
            );

            if (existing.length > 0) {
                await execute(
                    'UPDATE kuota SET kuota_diterima = ?, updated_at = NOW() WHERE id = ?',
                    [item.kuota, existing[0].id]
                );
            } else {
                await execute(
                    'INSERT INTO kuota (periode_tes_id, kabupaten_kota, kuota_diterima) VALUES (?, ?, ?)',
                    [id, item.kabupaten_kota, item.kuota]
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Kuota berhasil diupdate'
        });

    } catch (error) {
        console.error('Kuota POST error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
