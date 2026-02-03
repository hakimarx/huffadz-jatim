const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createUser() {
    console.log('Connecting to TiDB...');
    try {
        const connection = await mysql.createConnection({
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: 4000,
            user: '4K6TwTwqAHa9DAx.root',
            password: 'JeSHcJmvP6VqtEAq',
            database: 'huffadz_jatim',
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false }
        });

        console.log('Connected. Generating hash...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('Hashed Password:', hashedPassword);

        // Check if user exists first to avoid duplicate error
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', ['admin_fix@gmail.com']);

        if (existing.length > 0) {
            console.log('User admin_fix@gmail.com already exists. Updating password...');
            await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin_fix@gmail.com']);
            console.log('Password updated.');
        } else {
            console.log('Creating new user...');
            const [rows] = await connection.execute(
                'INSERT INTO users (email, password, role, nama, is_active) VALUES (?, ?, ?, ?, ?)',
                ['admin_fix@gmail.com', hashedPassword, 'admin_provinsi', 'Admin Fix', 1]
            );
            console.log('User created:', rows);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

createUser();
