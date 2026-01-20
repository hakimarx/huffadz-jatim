const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Debug log to check what password we are using (safely)
const pwd = process.env.DATABASE_PASSWORD || '';
console.log(`Using password: ${pwd.substring(0, 1)}***${pwd.substring(pwd.length - 1)} (Length: ${pwd.length})`);

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
    ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: true
    } : undefined,
    multipleStatements: true
};

async function runMigrations() {
    let connection;
    try {
        console.log('Connecting to database...');
        try {
            connection = await mysql.createConnection(dbConfig);
        } catch (connErr) {
            console.error("Connection failed details:", connErr.message, "Code:", connErr.code);
            if (connErr.code === 'ER_ACCESS_DENIED_ERROR') {
                console.error("Access denied. Please check your credentials in .env.local");
                // Attempt without password if localhost/root might rely on socket? no, usually password issue.
            }
            process.exit(1);
        }
        console.log('Connected to', dbConfig.database);

        // 1. Create migrations table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                run_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Get list of run migrations
        const [rows] = await connection.execute('SELECT name FROM _migrations');
        const runMigrations = new Set(rows.map(row => row.name));

        // 3. Get files from migrations folder
        const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found.');
            return;
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Sort by name (e.g. 001_..., 002_...)

        // 4. Run new migrations
        for (const file of files) {
            if (runMigrations.has(file)) {
                // console.log(`Skipping ${file} (already run)`);
                continue;
            }

            console.log(`Running migration: ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                // Simple check for duplicate column error handling "manually" if needed, 
                // but strictly migration system should fail if migration is invalid.
                // However, user might have manually added column.
                // We will try/catch.

                await connection.query('START TRANSACTION');
                await connection.query(sql);
                await connection.execute('INSERT INTO _migrations (name) VALUES (?)', [file]);
                await connection.query('COMMIT');
                console.log(`Successfully ran ${file}`);
            } catch (err) {
                await connection.query('ROLLBACK');

                // Special handling for "Duplicate column" if we want to be "idempotent-ish"
                if (file.includes('add_telepon') && err.message.includes('Duplicate column')) {
                    console.log(`Migration ${file} failed but looks like column already exists. Marking as done.`);
                    // We must manually mark it as done so it doesn't try again
                    await connection.execute('INSERT INTO _migrations (name) VALUES (?)', [file]);
                } else {
                    console.error(`Failed to run ${file}:`, err.message);
                    process.exit(1);
                }
            }
        }

        console.log('All migrations checked.');

    } catch (error) {
        console.error('Migration runner failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

runMigrations();
