const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSpecificUser() {
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

        console.log('Connecting to:', { ...config, password: '***' });

        const connection = await mysql.createConnection(config);

        const [rows] = await connection.execute(
            'SELECT id, email, password, nama, role, is_active FROM users WHERE email = ?',
            ['hakimarx@gmail.com']
        );

        if (rows.length > 0) {
            console.log('User found:', rows[0].email);
            console.log('Role:', rows[0].role);
            console.log('Is Active:', rows[0].is_active);
            console.log('Hash:', rows[0].password);
        } else {
            console.log('User hakimarx@gmail.com NOT found in database.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSpecificUser();
