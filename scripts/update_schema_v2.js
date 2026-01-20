const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Updating Database Schema V2 ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
        multipleStatements: true
    });

    // 1. Fix Penguji Table
    console.log('--- Updating penguji table ---');
    try {
        await connection.execute(`
            ALTER TABLE penguji 
            ADD COLUMN IF NOT EXISTS lokasi_tes VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS periode_tes VARCHAR(100) NULL,
            ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        console.log('✅ Added missing columns to penguji table.');
    } catch (err) {
        if (err.code === '42000' || err.errno === 1064) {
            console.log('Fallback: Adding columns individually...');
            const cols = ['lokasi_tes', 'periode_tes', 'updated_at'];
            const types = ['VARCHAR(255) NULL', 'VARCHAR(100) NULL', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'];

            for (let i = 0; i < cols.length; i++) {
                try {
                    const [check] = await connection.execute(`SHOW COLUMNS FROM penguji LIKE '${cols[i]}'`);
                    if (check.length === 0) {
                        await connection.execute(`ALTER TABLE penguji ADD COLUMN ${cols[i]} ${types[i]}`);
                        console.log(`Added ${cols[i]}`);
                    }
                } catch (e) { console.error(e.message); }
            }
        } else {
            console.error('Error:', err.message);
        }
    }

    // 2. Create Riwayat Mengajar Table
    console.log('\n--- Creating riwayat_mengajar table ---');
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS riwayat_mengajar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hafiz_id INT NOT NULL,
                tempat_mengajar VARCHAR(255) NOT NULL,
                tmt_mulai DATE NULL,
                tmt_selesai DATE NULL,
                keterangan TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (hafiz_id) REFERENCES hafiz(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Table riwayat_mengajar created/verified.');
    } catch (err) {
        console.error('Error creating riwayat_mengajar:', err.message);
    }

    await connection.end();
    console.log('\nSchema update complete.');
}

main().catch(console.error);
