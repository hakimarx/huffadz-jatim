const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
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

        console.log('--- Migrating Users Table ---');
        try {
            await connection.execute('ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('Added updated_at to users');
        } catch (e) { console.log('updated_at might already exist in users or error:', e.message); }

        try {
            await connection.execute('ALTER TABLE users ADD COLUMN telepon VARCHAR(20) NULL AFTER kabupaten_kota');
            console.log('Added telepon to users');
        } catch (e) { console.log('telepon might already exist in users or error:', e.message); }

        console.log('--- Migrating Hafiz Table ---');
        const hafizColumns = [
            'ALTER TABLE hafiz ADD COLUMN user_id INT NULL AFTER id',
            'ALTER TABLE hafiz ADD COLUMN is_aktif TINYINT(1) DEFAULT 1 AFTER status_kelulusan',
            'ALTER TABLE hafiz ADD COLUMN rt VARCHAR(10) NULL AFTER alamat',
            'ALTER TABLE hafiz ADD COLUMN rw VARCHAR(10) NULL AFTER rt',
            'ALTER TABLE hafiz ADD COLUMN telepon VARCHAR(20) NULL AFTER kabupaten_kota',
            'ALTER TABLE hafiz ADD COLUMN email VARCHAR(255) NULL AFTER telepon',
            'ALTER TABLE hafiz ADD COLUMN sertifikat_tahfidz VARCHAR(255) NULL AFTER email',
            'ALTER TABLE hafiz ADD COLUMN tmt_mengajar DATE NULL AFTER mengajar',
            'ALTER TABLE hafiz ADD COLUMN tempat_mengajar VARCHAR(255) NULL AFTER tmt_mengajar',
            'ALTER TABLE hafiz ADD COLUMN tempat_mengajar_2 VARCHAR(255) NULL AFTER tempat_mengajar',
            'ALTER TABLE hafiz ADD COLUMN tmt_mengajar_2 DATE NULL AFTER tempat_mengajar_2',
            'ALTER TABLE hafiz ADD COLUMN periode_tes_id INT NULL AFTER tahun_tes',
            'ALTER TABLE hafiz ADD COLUMN nilai_tahfidz DECIMAL(5,2) NULL AFTER status_kelulusan',
            'ALTER TABLE hafiz ADD COLUMN nilai_wawasan DECIMAL(5,2) NULL AFTER nilai_tahfidz',
            'ALTER TABLE hafiz ADD COLUMN foto_ktp VARCHAR(255) NULL AFTER nilai_wawasan',
            'ALTER TABLE hafiz ADD COLUMN foto_profil VARCHAR(255) NULL AFTER foto_ktp',
            'ALTER TABLE hafiz ADD COLUMN nomor_piagam VARCHAR(100) NULL AFTER foto_profil',
            'ALTER TABLE hafiz ADD COLUMN tanggal_lulus DATE NULL AFTER nomor_piagam',
            'ALTER TABLE hafiz ADD COLUMN status_insentif VARCHAR(20) DEFAULT "aktif" AFTER tanggal_lulus',
            'ALTER TABLE hafiz ADD COLUMN keterangan TEXT NULL AFTER status_insentif',
            'ALTER TABLE hafiz ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ];

        for (const sql of hafizColumns) {
            try {
                await connection.execute(sql);
                console.log(`Executed: ${sql}`);
            } catch (e) {
                console.log(`Failed or already exists: ${sql.substring(0, 50)}... Error: ${e.message}`);
            }
        }

        console.log('Migration complete!');
        await connection.end();
    } catch (error) {
        console.error('Migration error:', error);
    }
}

migrate();
