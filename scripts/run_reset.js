const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function resetUser() {
    console.log('🔄 Menghapus akun hakimarx@gmail.com...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'huffadz_jatim',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const sqlPath = path.join(__dirname, 'reset_user.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const [results] = await connection.query(sql);
        console.log('✅ BERHASIL! Akun hakimarx@gmail.com sudah dihapus dari database.');
        console.log('👉 Sekarang Anda bisa mendaftar ulang menggunakan email ini.');

        await connection.end();
    } catch (error) {
        console.error('❌ Gagal menghapus user:', error.message);
    }
}

resetUser();
