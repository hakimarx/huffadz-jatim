const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkTables() {
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

        console.log('--- Tables ---');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(tables);

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`\n--- Schema for ${tableName} ---`);
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.table(columns);
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();
