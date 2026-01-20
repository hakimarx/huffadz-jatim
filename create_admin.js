const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'huffadz_jatim',
        });

        const email = 'hakimarx@gmail.com';
        const password = 'password123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user exists first (double check)
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            console.log('User already exists. Updating password...');
            await connection.execute(
                'UPDATE users SET password = ?, role = "admin_provinsi", is_active = 1 WHERE email = ?',
                [hashedPassword, email]
            );
            console.log('User updated successfully.');
        } else {
            console.log('Creating new user...');
            await connection.execute(
                'INSERT INTO users (email, password, nama, role, is_active) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, 'Hakim Arx', 'admin_provinsi', 1]
            );
            console.log('User created successfully.');
        }

        console.log(`\n✅ Akun siap digunakan:\nEmail: ${email}\nPassword: ${password}`);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

createAdmin();
