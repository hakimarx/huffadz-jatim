const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkPasswordHash() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const [rows] = await connection.execute(
            'SELECT email, password FROM users WHERE email = ?',
            ['hakimarx@gmail.com']
        );

        if (rows.length > 0) {
            console.log('User found:', rows[0].email);
            console.log('Hash:', rows[0].password);
        } else {
            console.log('User hakimarx@gmail.com NOT found.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPasswordHash();
