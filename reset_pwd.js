const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function resetPassword() {
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

        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'hakimarx@gmail.com']
        );

        if (result.affectedRows > 0) {
            console.log('Password for hakimarx@gmail.com has been reset to: admin123');
        } else {
            console.log('User hakimarx@gmail.com NOT found.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetPassword();
