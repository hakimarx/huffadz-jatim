const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runManualVerify() {
    console.log('🔄 Memverifikasi akun hakim.luk81@gmail.com secara manual...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'huffadz_jatim',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const sqlPath = path.join(__dirname, 'manual_verify.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const [results] = await connection.query(sql);
        console.log('✅ Akun berhasil diverifikasi!');
        console.log('Hasil:', results[1]); // Menampilkan hasil SELECT

        await connection.end();
    } catch (error) {
        console.error('❌ Gagal memverifikasi:', error.message);
    }
}

runManualVerify();
