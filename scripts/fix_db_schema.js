const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'huffadz_jatim'
        });
        console.log('Connected.');

        // 1. Fix Users Table
        console.log('Checking users table...');
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS telepon VARCHAR(20) NULL,
                ADD COLUMN IF NOT EXISTS kabupaten_kota VARCHAR(100) NULL,
                ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
                ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1
            `);
            console.log('Users table updated.');
        } catch (e) {
            console.log('Users table update skipped/error:', e.message);
        }

        // 2. Fix Hafiz Table
        console.log('Checking hafiz table...');
        try {
            await connection.execute(`
                ALTER TABLE hafiz 
                ADD COLUMN IF NOT EXISTS foto_profil VARCHAR(255) NULL,
                ADD COLUMN IF NOT EXISTS foto_ktp VARCHAR(255) NULL,
                MODIFY COLUMN tanda_tangan TEXT NULL -- Ensure it exists or make it nullable
            `);
            console.log('Hafiz table updated.');
        } catch (e) {
            console.log('Hafiz table update skipped/error:', e.message);
            // If error is about tanda_tangan not existing, try adding it
            try {
                await connection.execute(`ALTER TABLE hafiz ADD COLUMN tanda_tangan TEXT NULL`);
                console.log('Added tanda_tangan column.');
            } catch (e2) { }
        }

        console.log('Database schema fix completed.');

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
