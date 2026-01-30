const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixSchema() {
    console.log('🚀 Checking and fixing database schema...');

    const dbConfig = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'huffadz_jatim',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    };

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database:', dbConfig.database);

        // 1. Check users table
        const [userCols] = await connection.execute('DESCRIBE users');
        const userColNames = userCols.map(c => c.Field);

        if (!userColNames.includes('status')) {
            console.log('➕ Adding missing "status" column to users table...');
            await connection.execute("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'pending' AFTER is_active");
            console.log('✅ Column "status" added to users.');
        } else {
            console.log('✔ users table already has "status" column.');
        }

        // 2. Check hafiz table
        const [hafizCols] = await connection.execute('DESCRIBE hafiz');
        const hafizColNames = hafizCols.map(c => c.Field);

        if (!hafizColNames.includes('tanda_tangan')) {
            console.log('➕ Adding missing "tanda_tangan" column to hafiz table...');
            await connection.execute("ALTER TABLE hafiz ADD COLUMN tanda_tangan TEXT DEFAULT NULL AFTER foto_profil");
            console.log('✅ Column "tanda_tangan" added to hafiz.');
        } else {
            console.log('✔ hafiz table already has "tanda_tangan" column.');
        }

        console.log('✨ All missing columns checked and updated!');
    } catch (error) {
        console.error('❌ Error fixing schema:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
