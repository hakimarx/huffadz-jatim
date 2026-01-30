const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSpecificUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const [rows] = await connection.execute(
            'SELECT id, email, nama, role, is_active FROM users WHERE email = ?',
            ['hakimarx@gmail.com']
        );

        if (rows.length > 0) {
            console.log('User found:', rows[0]);
        } else {
            console.log('User hakimarx@gmail.com NOT found in database.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSpecificUser();
