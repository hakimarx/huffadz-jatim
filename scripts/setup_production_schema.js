// Setup Production Schema - Create missing tables
const mysql = require('mysql2/promise');
require('dotenv').config({ path: process.argv[2] === '--production' ? '.env.production' : '.env.local' });

async function main() {
    const config = {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '4000'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    };

    console.log('=== Setting up Production Schema ===\n');
    console.log('Database Host:', config.host);
    console.log('Database Name:', config.database);
    console.log('');

    let connection;
    try {
        connection = await mysql.createConnection(config);

        // Check existing tables
        console.log('=== Checking existing tables ===');
        const [tables] = await connection.execute('SHOW TABLES');
        const existingTables = tables.map(t => Object.values(t)[0]);
        console.log('Existing tables:', existingTables.join(', ') || 'none');

        // Create penguji table if not exists
        if (!existingTables.includes('penguji')) {
            console.log('\nCreating penguji table...');
            await connection.execute(`
                CREATE TABLE penguji (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nama VARCHAR(255) NOT NULL,
                    gelar VARCHAR(50) DEFAULT NULL,
                    institusi VARCHAR(255) DEFAULT NULL,
                    telepon VARCHAR(20) DEFAULT NULL,
                    email VARCHAR(255) DEFAULT NULL,
                    lokasi_tes VARCHAR(255) DEFAULT NULL,
                    periode_tes VARCHAR(100) DEFAULT NULL,
                    is_active TINYINT(1) DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✓ penguji table created');
        } else {
            console.log('\n✓ penguji table already exists');
            // Check for missing columns
            const [cols] = await connection.execute('DESCRIBE penguji');
            const colNames = cols.map(c => c.Field);

            if (!colNames.includes('lokasi_tes')) {
                await connection.execute('ALTER TABLE penguji ADD COLUMN lokasi_tes VARCHAR(255) DEFAULT NULL');
                console.log('  + Added lokasi_tes column');
            }
            if (!colNames.includes('periode_tes')) {
                await connection.execute('ALTER TABLE penguji ADD COLUMN periode_tes VARCHAR(100) DEFAULT NULL');
                console.log('  + Added periode_tes column');
            }
            if (!colNames.includes('updated_at')) {
                await connection.execute('ALTER TABLE penguji ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
                console.log('  + Added updated_at column');
            }
        }

        // Check hafiz table for missing columns
        if (existingTables.includes('hafiz')) {
            console.log('\n=== Checking hafiz table columns ===');
            const [hafizCols] = await connection.execute('DESCRIBE hafiz');
            const hafizColNames = hafizCols.map(c => c.Field);

            if (!hafizColNames.includes('nama_bank')) {
                await connection.execute('ALTER TABLE hafiz ADD COLUMN nama_bank VARCHAR(100) DEFAULT NULL');
                console.log('+ Added nama_bank column');
            } else {
                console.log('✓ nama_bank exists');
            }

            if (!hafizColNames.includes('nomor_rekening')) {
                await connection.execute('ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(50) DEFAULT NULL');
                console.log('+ Added nomor_rekening column');
            } else {
                console.log('✓ nomor_rekening exists');
            }
        }

        // List final tables
        console.log('\n=== Final tables ===');
        const [finalTables] = await connection.execute('SHOW TABLES');
        console.log(finalTables.map(t => Object.values(t)[0]).join(', '));

        console.log('\n=== Schema setup complete! ===');

    } catch (err) {
        console.error('Error:', err.message);
        console.error(err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main().catch(console.error);
