const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    console.log('🔄 Memulai update database...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'huffadz_jatim',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Terkoneksi ke database.');

        const sqlPath = path.join(__dirname, 'database', 'add_email_verification.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Menjalankan script SQL...');
        await connection.query(sql);

        console.log('✅ Database berhasil diupdate!');
        console.log('   - Kolom is_verified ditambahkan');
        console.log('   - Kolom verification_token ditambahkan');

        await connection.end();
    } catch (error) {
        console.error('❌ Gagal mengupdate database:', error.message);
    }
}

runMigration();
