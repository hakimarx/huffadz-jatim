const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkUser() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
    });

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', ['hakim.luk81@gmail.com']);
    console.log('User:', rows[0]);

    const [hafizRows] = await connection.execute('SELECT * FROM hafiz WHERE user_id = ?', [11]);
    console.log('Hafiz Profile:', hafizRows[0]);

    await connection.end();
}

checkUser().catch(console.error);
