// Fix Production Schema for TiDB Cloud
// Run with: node scripts/fix_tidb_schema.js <host> <port> <user> <password> <database>
// Or set environment variables with .env.production file

const mysql = require('mysql2/promise');
require('dotenv').config({ path: process.argv[2] === '--production' ? '.env.production' : '.env.local' });

async function main() {
    // Allow command line arguments to override env vars for production fix
    const args = process.argv.slice(2);

    let config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '4000'),  // TiDB default port
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    };

    // If arguments provided, use them
    if (args.length >= 5 && args[0] !== '--production') {
        config = {
            host: args[0],
            port: parseInt(args[1]),
            user: args[2],
            password: args[3],
            database: args[4],
            ssl: { rejectUnauthorized: true },
        };
    }

    console.log('=== Fixing TiDB/MySQL Schema ===\n');
    console.log('Database Host:', config.host);
    console.log('Database Port:', config.port);
    console.log('Database Name:', config.database);
    console.log('SSL:', config.ssl ? 'true' : 'false');
    console.log('');

    let connection;
    try {
        connection = await mysql.createConnection(config);

        // 1. Check and fix penguji table
        console.log('=== Checking penguji table ===');
        const [pengujiCols] = await connection.execute('DESCRIBE penguji');
        const pengujiColNames = pengujiCols.map(c => c.Field);
        console.log('Current columns:', pengujiColNames.join(', '));

        if (!pengujiColNames.includes('lokasi_tes')) {
            console.log('Adding lokasi_tes column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN lokasi_tes VARCHAR(255) DEFAULT NULL');
            console.log('✓ lokasi_tes added');
        } else {
            console.log('✓ lokasi_tes already exists');
        }

        if (!pengujiColNames.includes('periode_tes')) {
            console.log('Adding periode_tes column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN periode_tes VARCHAR(100) DEFAULT NULL');
            console.log('✓ periode_tes added');
        } else {
            console.log('✓ periode_tes already exists');
        }

        if (!pengujiColNames.includes('updated_at')) {
            console.log('Adding updated_at column...');
            await connection.execute('ALTER TABLE penguji ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('✓ updated_at added');
        } else {
            console.log('✓ updated_at already exists');
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
        } else {
            console.log('✓ nama_bank already exists');
        }

        if (!hafizColNames.includes('nomor_rekening')) {
            console.log('Adding nomor_rekening column...');
            await connection.execute('ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(50) DEFAULT NULL');
            console.log('✓ nomor_rekening added');
        } else {
            console.log('✓ nomor_rekening already exists');
        }

        console.log('\n=== Schema fix complete! ===');

        // Verify
        console.log('\n=== Final penguji table schema ===');
        const [newPengujiCols] = await connection.execute('DESCRIBE penguji');
        console.table(newPengujiCols.map(c => ({ Field: c.Field, Type: c.Type })));

    } catch (err) {
        console.error('Error:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('\nCannot connect to database. Check your credentials and network.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\nAccess denied. Check your username and password.');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main().catch(console.error);
