const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const [rows] = await connection.execute(
            'SELECT id, email, nama, role, is_active FROM users LIMIT 10'
        );

        console.log('Users in database:', rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
