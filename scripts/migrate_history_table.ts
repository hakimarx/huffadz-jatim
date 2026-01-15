import { createConnection } from 'mysql2/promise';

async function migrate() {
    const connection = await createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'huffadz_jatim',
    });

    try {
        console.log('Running migration for riwayat_mengajar...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS riwayat_mengajar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hafiz_id INT NOT NULL,
                tempat_mengajar VARCHAR(255) NOT NULL,
                tmt_mulai DATE NULL,
                tmt_selesai DATE NULL,
                keterangan TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hafiz_id) REFERENCES hafiz(id) ON DELETE CASCADE
            )
        `);
        console.log('Table riwayat_mengajar checked/created.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
