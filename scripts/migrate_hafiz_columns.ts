import { createConnection } from 'mysql2/promise';

async function migrate() {
    const connection = await createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'huffadz_jatim',
    });

    try {
        console.log('Running migration...');

        // Add tanda_tangan column if not exists
        try {
            await connection.query(`
                ALTER TABLE hafiz 
                ADD COLUMN tanda_tangan TEXT NULL,
                ADD COLUMN nama_bank VARCHAR(100) NULL,
                ADD COLUMN nomor_rekening VARCHAR(100) NULL,
                ADD COLUMN is_aktif BOOLEAN DEFAULT TRUE
            `);
            console.log('Columns added successfully');
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist, skipping...');
            } else {
                console.error('Error adding columns:', err.message);
            }
        }

        console.log('Migration complete');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
