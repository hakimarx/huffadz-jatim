
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
};

async function fixSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // Check columns
        const [columns] = await connection.execute('DESCRIBE hafiz');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames);

        if (!columnNames.includes('nama_bank')) {
            console.log('Adding nama_bank column...');
            await connection.execute('ALTER TABLE hafiz ADD COLUMN nama_bank VARCHAR(100) NULL AFTER email');
            console.log('nama_bank added.');
        } else {
            console.log('nama_bank already exists.');
        }

        if (!columnNames.includes('nomor_rekening')) {
            console.log('Adding nomor_rekening column...');
            await connection.execute('ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(50) NULL AFTER nama_bank');
            console.log('nomor_rekening added.');
        } else {
            console.log('nomor_rekening already exists.');
        }

        console.log('Schema update complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
