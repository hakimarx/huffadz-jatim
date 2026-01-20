const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Checking Database Schema ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
    });

    // Check users table
    console.log('--- Table: users ---');
    const [usersCols] = await connection.execute('DESCRIBE users');
    console.table(usersCols);

    // Check hafiz table
    console.log('\n--- Table: hafiz ---');
    try {
        const [hafizCols] = await connection.execute('DESCRIBE hafiz');
        console.table(hafizCols);
    } catch (err) {
        console.log('Error describing hafiz:', err.message);
    }

    await connection.end();
}

main().catch(console.error);
