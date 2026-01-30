
import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
// import { getServerSession } from 'next-auth';

// Use a simplified session check or adjust based on your actual auth implementation
// Assuming you have a way to check user session, e.g., via a helper or direct DB check if using custom auth

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const hafizId = searchParams.get('hafiz_id');
        const kabupatenKota = searchParams.get('kabupaten_kota');

        let whereClause = '1=1';
        const params: any[] = [];

        if (hafizId) {
            whereClause += ' AND a.hafiz_id = ?';
            params.push(hafizId);
        }

        if (kabupatenKota) {
            whereClause += ' AND h.kabupaten_kota = ?';
            params.push(kabupatenKota);
        }

        // Fetch all attendance records with hafiz details
        const sql = `
            SELECT 
                a.id,
                a.hafiz_id,
                a.tanggal,
                a.waktu,
                a.status,
                a.keterangan,
                h.nama,
                h.nik,
                h.kabupaten_kota
            FROM absensi a
            JOIN hafiz h ON a.hafiz_id = h.id
            WHERE ${whereClause}
            ORDER BY a.tanggal DESC, a.waktu DESC
        `;

        const data = await query(sql, params);

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('Error fetching absensi:', error);
        return NextResponse.json(
            { error: 'Gagal memuat data absensi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hafiz_id, status, keterangan } = body;

        if (!hafiz_id || !status) {
            return NextResponse.json(
                { error: 'Data tidak lengkap' },
                { status: 400 }
            );
        }

        // Check if hafiz exists and get current info if needed
        // Assuming hafiz_id is valid for now

        const now = new Date();
        const tanggal = now.toISOString().split('T')[0];
        const waktu = now.toTimeString().split(' ')[0];

        const result = await insert(
            `INSERT INTO absensi (hafiz_id, tanggal, waktu, status, keterangan) 
             VALUES (?, ?, ?, ?, ?)`,
            [hafiz_id, tanggal, waktu, status, keterangan || null]
        );

        return NextResponse.json({
            success: true,
            message: 'Absensi berhasil dicatat',
            data: { id: result }
        });
    } catch (error: any) {
        console.error('Error recording absensi:', error);
        return NextResponse.json(
            { error: 'Gagal mencatat absensi' },
            { status: 500 }
        );
    }
}
