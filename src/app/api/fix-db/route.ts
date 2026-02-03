import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: string[] = [];

    try {
        console.log('Running DB migrations...');

        // 1. Add telepon column to users
        try {
            await execute("ALTER TABLE users ADD COLUMN telepon VARCHAR(20) AFTER kabupaten_kota");
            results.push("✓ Column 'telepon' added to users.");
        } catch (err: any) {
            if (err.message && err.message.includes("Duplicate column name")) {
                results.push("✓ Column 'telepon' already exists in users.");
            } else {
                results.push(`✗ Error adding 'telepon': ${err.message}`);
            }
        }

        // 2. Add kuota_total column to periode_tes
        try {
            await execute("ALTER TABLE periode_tes ADD COLUMN kuota_total INT DEFAULT 1000 AFTER tanggal_selesai");
            results.push("✓ Column 'kuota_total' added to periode_tes.");
        } catch (err: any) {
            if (err.message && err.message.includes("Duplicate column name")) {
                results.push("✓ Column 'kuota_total' already exists in periode_tes.");
            } else {
                results.push(`✗ Error adding 'kuota_total': ${err.message}`);
            }
        }

        // 3. Add is_aktif column to hafiz
        try {
            await execute("ALTER TABLE hafiz ADD COLUMN is_aktif TINYINT(1) DEFAULT 1 AFTER keterangan");
            results.push("✓ Column 'is_aktif' added to hafiz.");
        } catch (err: any) {
            if (err.message && err.message.includes("Duplicate column name")) {
                results.push("✓ Column 'is_aktif' already exists in hafiz.");
            } else {
                results.push(`✗ Error adding 'is_aktif': ${err.message}`);
            }
        }

        // 4. Create laporan_harian table if not exists
        try {
            await execute(`
                CREATE TABLE IF NOT EXISTS laporan_harian (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    hafiz_id INT NOT NULL,
                    tanggal DATE NOT NULL,
                    jenis_kegiatan ENUM('mengajar', 'murojah', 'khataman', 'lainnya') NOT NULL,
                    deskripsi TEXT,
                    foto VARCHAR(500),
                    lokasi VARCHAR(255),
                    durasi_menit INT,
                    status_verifikasi ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
                    verified_by INT,
                    verified_at DATETIME,
                    catatan_verifikasi TEXT,
                    jam VARCHAR(10),
                    foto_url VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (hafiz_id) REFERENCES hafiz(id) ON DELETE CASCADE
                )
            `);
            results.push("✓ Table 'laporan_harian' checked/created.");
        } catch (err: any) {
            results.push(`✗ Error creating 'laporan_harian': ${err.message}`);
        }

        // 5. Create riwayat_mengajar table if not exists
        try {
            await execute(`
                CREATE TABLE IF NOT EXISTS riwayat_mengajar (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    hafiz_id INT NOT NULL,
                    nama_lembaga VARCHAR(255) NOT NULL,
                    tmt_mulai DATE,
                    tmt_selesai DATE,
                    jabatan VARCHAR(100),
                    keterangan TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (hafiz_id) REFERENCES hafiz(id) ON DELETE CASCADE
                )
            `);
            results.push("✓ Table 'riwayat_mengajar' checked/created.");
        } catch (err: any) {
            results.push(`✗ Error creating 'riwayat_mengajar': ${err.message}`);
        }


        return NextResponse.json({
            success: true,
            message: "Migration completed.",
            results
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error), results },
            { status: 500 }
        );
    }
}
