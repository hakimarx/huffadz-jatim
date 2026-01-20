const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function resetPasswords() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '4000'),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            ssl: process.env.DATABASE_SSL === 'true' ? {
                rejectUnauthorized: true,
            } : undefined,
        });

        const newPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const usersToReset = [
            'hakimarx@gmail.com',
            'sby@mail.com',
            'hafiz123@mail.com'
        ];

        for (const email of usersToReset) {
            console.log(`Resetting password for ${email}...`);
            await connection.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, email]
            );
        }

        console.log('All test passwords reset to: password123');
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetPasswords();
