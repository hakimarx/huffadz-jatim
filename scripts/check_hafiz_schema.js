const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
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

        const [rows] = await connection.execute('DESCRIBE hafiz');
        console.log('Columns in hafiz table:');
        rows.forEach(row => console.log(`- ${row.Field} (${row.Type})`));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
