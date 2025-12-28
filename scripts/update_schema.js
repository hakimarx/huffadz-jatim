const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Updating Database Schema ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
        multipleStatements: true
    });

    // Add missing columns to hafiz table
    console.log('--- Checking hafiz columns ---');
    try {
        await connection.execute(`
            ALTER TABLE hafiz 
            ADD COLUMN IF NOT EXISTS nama_bank VARCHAR(100) NULL,
            ADD COLUMN IF NOT EXISTS nomor_rekening VARCHAR(100) NULL
        `);
        console.log('✅ Added nama_bank and nomor_rekening to hafiz table.');
    } catch (err) {
        // Fallback for older MySQL that doesn't support IF NOT EXISTS in ADD COLUMN
        if (err.code === '42000' || err.errno === 1064) {
            console.log('Trying fallback for ADD COLUMN...');
            try {
                // Check if column exists first
                const [cols] = await connection.execute("SHOW COLUMNS FROM hafiz LIKE 'nama_bank'");
                if (cols.length === 0) {
                    await connection.execute('ALTER TABLE hafiz ADD COLUMN nama_bank VARCHAR(100) NULL');
                    console.log('Added nama_bank');
                }
                const [cols2] = await connection.execute("SHOW COLUMNS FROM hafiz LIKE 'nomor_rekening'");
                if (cols2.length === 0) {
                    await connection.execute('ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(100) NULL');
                    console.log('Added nomor_rekening');
                }
            } catch (e) {
                console.error('Error adding columns:', e.message);
            }
        } else {
            console.error('Error:', err.message);
        }
    }

    // Check users table role enum
    console.log('\n--- Checking users table ---');
    const [userCols] = await connection.execute("SHOW COLUMNS FROM users LIKE 'role'");
    console.log('Role column:', userCols[0].Type);

    await connection.end();
    console.log('\nSchema update complete.');
}

main().catch(console.error);
