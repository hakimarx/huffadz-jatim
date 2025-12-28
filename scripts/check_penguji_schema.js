const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Checking Penguji Table Schema ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
    });

    // Check penguji table
    try {
        const [pengujiCols] = await connection.execute('DESCRIBE penguji');
        console.table(pengujiCols);
    } catch (err) {
        console.error('Error describing penguji:', err.message);
    }

    await connection.end();
}

main().catch(console.error);
