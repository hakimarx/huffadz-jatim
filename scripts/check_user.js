const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const [rows] = await connection.execute(
            'SELECT id, email, nama, role, is_active, password FROM users WHERE email = ?',
            ['hakimarx@gmail.com']
        );

        if (rows.length > 0) {
            console.log('User found:', {
                ...rows[0],
                password: rows[0].password ? 'HASHED_PASSWORD_EXISTS' : 'NO_PASSWORD'
            });
        } else {
            console.log('User NOT found');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
