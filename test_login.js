const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const email = 'hakimarx@gmail.com';
        const password = 'password123';

        console.log(`Testing login for ${email}...`);

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            console.log('❌ User not found');
            return;
        }

        const user = rows[0];
        console.log('User found. Verifying password...');

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log('✅ Login SUCCESS! Password matches.');
        } else {
            console.log('❌ Login FAILED! Password does not match.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
