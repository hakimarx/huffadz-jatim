const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addTandaTanganColumn() {
    try {
        const config = {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306'),
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'huffadz_jatim',
            ssl: process.env.DATABASE_SSL === 'true' ? {
                rejectUnauthorized: true,
            } : undefined,
        };

        const connection = await mysql.createConnection(config);

        console.log('Adding tanda_tangan column to hafiz table...');
        await connection.execute('ALTER TABLE hafiz ADD COLUMN tanda_tangan VARCHAR(255) NULL AFTER foto_profil');
        console.log('Column added successfully.');

        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column tanda_tangan already exists.');
        } else {
            console.error('Error:', error);
        }
    }
}

addTandaTanganColumn();
