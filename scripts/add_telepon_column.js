const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

console.log('DATABASE_USER:', process.env.DATABASE_USER);
const pwd = process.env.DATABASE_PASSWORD || '';
console.log('Password length:', pwd.length);
if (pwd.length > 0) {
    console.log('First char:', pwd[0]);
    console.log('Last char:', pwd[pwd.length - 1]);
}

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: pwd,
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
    ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: true
    } : undefined
};

async function run() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        try {
            await connection.execute("ALTER TABLE users ADD COLUMN telepon VARCHAR(20) AFTER kabupaten_kota");
            console.log("Successfully added 'telepon' column.");
        } catch (err) {
            if (err.message && err.message.includes("Duplicate column name")) {
                console.log("'telepon' column already exists.");
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
