const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        port: process.env.DATABASE_PORT || 3306
    });

    try {
        console.log('Adding verification columns to users table...');
        await connection.execute(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL
        `);
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

main();
