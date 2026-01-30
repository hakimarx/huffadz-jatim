const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Updating Database Schema V3 ===\n');

    // Support both DB_ and DATABASE_ prefix
    const host = process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '3306');
    const user = process.env.DATABASE_USER || process.env.DB_USER || 'root';
    const password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '';
    const database = process.env.DATABASE_NAME || process.env.DB_NAME || 'huffadz_jatim';

    const connection = await mysql.createConnection({
        host, port, user, password, database,
        multipleStatements: true
    });

    console.log(`Connected to ${database} as ${user}`);

    // 1. Add Status column to users
    console.log('--- Updating users table ---');
    try {
        await connection.execute(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS status ENUM('pending', 'active', 'suspended') DEFAULT 'pending' AFTER is_active,
            ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) DEFAULT 0 AFTER status,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL AFTER is_verified
        `);
        console.log('✅ Updated users table structure.');
    } catch (err) {
        console.log('Notice (users):', err.message);
    }

    // 1b. Add missing columns to hafiz table
    console.log('--- Checking hafiz table columns ---');
    try {
        await connection.execute(`
            ALTER TABLE hafiz 
            ADD COLUMN IF NOT EXISTS nama_bank VARCHAR(100) NULL AFTER email,
            ADD COLUMN IF NOT EXISTS nomor_rekening VARCHAR(50) NULL AFTER nama_bank,
            ADD COLUMN IF NOT EXISTS tanda_tangan TEXT NULL AFTER foto_profil
        `);
        console.log('✅ Updated hafiz table structure.');
    } catch (err) {
        console.log('Notice (hafiz):', err.message);
    }

    // 2. Add Indexes for performance
    console.log('\n--- Adding indexes ---');
    const indexes = [
        { table: 'users', column: 'email', name: 'idx_users_email' },
        { table: 'users', column: 'role', name: 'idx_users_role' },
        { table: 'users', column: 'kabupaten_kota', name: 'idx_users_kabkota' },
        { table: 'hafiz', column: 'user_id', name: 'idx_hafiz_user_id' },
        { table: 'hafiz', column: 'nik', name: 'idx_hafiz_nik' },
        { table: 'hafiz', column: 'kabupaten_kota', name: 'idx_hafiz_kabkota' },
        { table: 'hafiz', column: 'nama', name: 'idx_hafiz_nama' },
        { table: 'hafiz', column: 'tahun_tes', name: 'idx_hafiz_tahun_tes' },
        { table: 'riwayat_mengajar', column: 'hafiz_id', name: 'idx_riwayat_hafiz_id' }
    ];

    for (const idx of indexes) {
        try {
            // Check if index exists first (MySQL doesn't have CREATE INDEX IF NOT EXISTS directly)
            const [rows] = await connection.execute(`
                SELECT COUNT(1) as has_idx FROM information_schema.statistics 
                WHERE table_schema = ? AND table_name = ? AND index_name = ?
            `, [database, idx.table, idx.name]);

            if (rows[0].has_idx === 0) {
                await connection.execute(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`);
                console.log(`✅ Created index ${idx.name} on ${idx.table}(${idx.column})`);
            } else {
                console.log(`ℹ️ Index ${idx.name} already exists.`);
            }
        } catch (e) {
            console.error(`❌ Error creating index ${idx.name}:`, e.message);
        }
    }

    // 3. Make NIK Unique
    console.log('\n--- Setting NIK as Unique ---');
    try {
        const [rows] = await connection.execute(`
            SELECT COUNT(1) as has_constraint FROM information_schema.table_constraints
            WHERE table_schema = ? AND table_name = 'hafiz' AND constraint_name = 'uni_nik'
        `, [database]);

        if (rows[0].has_constraint === 0) {
            await connection.execute(`ALTER TABLE hafiz ADD CONSTRAINT uni_nik UNIQUE (nik)`);
            console.log('✅ Set NIK as UNIQUE in hafiz table.');
        } else {
            console.log('ℹ️ NIK already has UNIQUE constraint.');
        }
    } catch (e) {
        console.error('❌ Error setting NIK unique:', e.message);
    }

    await connection.end();
    console.log('\n=== Schema update V3 complete ===');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
