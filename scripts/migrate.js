const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        console.log('Connected to DB. Running migrations...');

        // 1. Create riwayat_mengajar
        try {
            await conn.execute(`
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
            console.log('✓ Table riwayat_mengajar created/checked.');
        } catch (e) {
            console.log('✗ riwayat_mengajar error:', e.message);
        }

        // 2. Create laporan_harian (just in case)
        try {
            await conn.execute(`
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
            // Check if columns jam and foto_url exist
            try { await conn.execute("ALTER TABLE laporan_harian ADD COLUMN jam VARCHAR(10)"); console.log('✓ Added column jam'); } catch (e) { }
            try { await conn.execute("ALTER TABLE laporan_harian ADD COLUMN foto_url VARCHAR(500)"); console.log('✓ Added column foto_url'); } catch (e) { }

            console.log('✓ Table laporan_harian checked.');
        } catch (e) {
            console.log('✗ laporan_harian error:', e.message);
        }

        // 3. Add is_aktif to hafiz
        try {
            await conn.execute("ALTER TABLE hafiz ADD COLUMN is_aktif TINYINT(1) DEFAULT 1 AFTER keterangan");
            console.log('✓ Column is_aktif added to hafiz.');
        } catch (e) { /* ignore duplicate */ }

        await conn.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
})();
