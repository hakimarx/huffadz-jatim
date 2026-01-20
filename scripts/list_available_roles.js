const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listUsers() {
    try {
        console.log('Connecting to database...');
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

        const [rows] = await connection.execute(
            'SELECT email, role, nama FROM users LIMIT 20'
        );

        console.log('Users in database:');
        rows.forEach(user => {
            console.log(`- ${user.email} (${user.role}) : ${user.nama}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
