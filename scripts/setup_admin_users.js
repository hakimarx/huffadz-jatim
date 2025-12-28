// Script untuk generate bcrypt hash dan update admin users
// Run: node scripts/setup_admin_users.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Setup Admin Users ===\n');

    // Generate password hashes
    const adminPass = await bcrypt.hash('g4yung4n', 12);
    const testPass = await bcrypt.hash('123456', 12);

    console.log('Generated hashes:');
    console.log('g4yung4n:', adminPass);
    console.log('123456:', testPass);

    // Connect to database
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
    });

    console.log('\nConnected to database\n');

    // Delete existing admin users
    await connection.execute(`
        DELETE FROM users WHERE email IN (
            'hakimarx@gmail.com',
            'adminsby@huffadz.jatim.go.id',
            'hafiz@test.com'
        )
    `);
    console.log('Deleted existing admin users');

    // Insert admin provinsi
    await connection.execute(`
        INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active)
        VALUES (?, ?, 'admin_provinsi', 'Admin Provinsi Jawa Timur', NULL, 1)
    `, ['hakimarx@gmail.com', adminPass]);
    console.log('Created: hakimarx@gmail.com (password: g4yung4n)');

    // Insert admin kabko
    await connection.execute(`
        INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active)
        VALUES (?, ?, 'admin_kabko', 'Admin Kota Surabaya', 'Kota Surabaya', 1)
    `, ['adminsby@huffadz.jatim.go.id', testPass]);
    console.log('Created: adminsby@huffadz.jatim.go.id (password: 123456)');

    // Insert hafiz test
    await connection.execute(`
        INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active)
        VALUES (?, ?, 'hafiz', 'Test Hafiz', 'Kota Surabaya', 1)
    `, ['hafiz@test.com', testPass]);
    console.log('Created: hafiz@test.com (password: 123456)');

    // Verify
    const [rows] = await connection.execute('SELECT id, email, role, nama FROM users');
    console.log('\nUsers in database:');
    console.table(rows);

    await connection.end();
    console.log('\nDone!');
}

main().catch(console.error);
