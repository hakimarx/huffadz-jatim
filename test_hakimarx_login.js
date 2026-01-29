const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testLoginByLogic() {
    const email = 'hakimarx@gmail.com';
    const password = 'admin123';

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

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (rows.length === 0) {
            console.log('Login failed: User not found or inactive');
            await connection.end();
            return;
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log('Login SUCCESS for:', email);
        } else {
            console.log('Login FAILED: Password mismatch');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

testLoginByLogic();
