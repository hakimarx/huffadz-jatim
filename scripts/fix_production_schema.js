// Fix Production Schema
// Menambahkan kolom yang kurang di production database
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('=== Fixing Production Schema ===\n');
    console.log('Database Host:', process.env.DATABASE_HOST);
    console.log('Database Name:', process.env.DATABASE_NAME);
    console.log('SSL:', process.env.DATABASE_SSL);
    console.log('');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    try {
        // 1. Check and fix penguji table
        console.log('=== Checking penguji table ===');
        const [pengujiCols] = await connection.execute('DESCRIBE penguji');
        const pengujiColNames = pengujiCols.map(c => c.Field);
        console.log('Current columns:', pengujiColNames.join(', '));

        if (!pengujiColNames.includes('lokasi_tes')) {
            console.log('Adding lokasi_tes column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN lokasi_tes VARCHAR(255) DEFAULT NULL');
            console.log('✓ lokasi_tes added');
        }

        if (!pengujiColNames.includes('periode_tes')) {
            console.log('Adding periode_tes column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN periode_tes VARCHAR(100) DEFAULT NULL');
            console.log('✓ periode_tes added');
        }

        if (!pengujiColNames.includes('updated_at')) {
            console.log('Adding updated_at column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('✓ updated_at added');
        }

        // 2. Check and fix hafiz table
        console.log('\n=== Checking hafiz table ===');
        const [hafizCols] = await connection.execute('DESCRIBE hafiz');
        const hafizColNames = hafizCols.map(c => c.Field);
        console.log('Current columns:', hafizColNames.join(', '));

        if (!hafizColNames.includes('nama_bank')) {
            console.log('Adding nama_bank column...');
            await connection.execute('ALTER TABLE hafiz ADD COLUMN nama_bank VARCHAR(100) DEFAULT NULL');
            console.log('✓ nama_bank added');
        }

        if (!hafizColNames.includes('nomor_rekening')) {
            console.log('Adding nomor_rekening column...');
            await connection.execute('ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(50) DEFAULT NULL');
            console.log('✓ nomor_rekening added');
        }

        console.log('\n=== Schema fix complete! ===');

        // Verify
        console.log('\n=== Verifying penguji table ===');
        const [newPengujiCols] = await connection.execute('DESCRIBE penguji');
        console.table(newPengujiCols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

        console.log('\n=== Verifying hafiz table (relevant columns) ===');
        const [newHafizCols] = await connection.execute('DESCRIBE hafiz');
        const relevantCols = newHafizCols.filter(c => ['nama_bank', 'nomor_rekening'].includes(c.Field));
        console.table(relevantCols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

    } catch (err) {
        console.error('Error:', err.message);
        console.error(err);
    }

    await connection.end();
}

main().catch(console.error);
