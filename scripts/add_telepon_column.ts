import { execute } from '@/lib/db';

async function run() {
    try {
        console.log('Adding telepon column to users table...');

        // Check if column exists (optional, but good for idempotency if we had complex logic, but ALTER TABLE ADD COLUMN usually fails if exists unless IF NOT EXISTS is used, but in MySQL < 8.0 IF NOT EXISTS for column is not standard. TiDB supports it? Let's try simple ADD COLUMN and catch error if exists)

        try {
            await execute("ALTER TABLE users ADD COLUMN telepon VARCHAR(20) AFTER kabupaten_kota");
            console.log("Successfully added 'telepon' column.");
        } catch (err: any) {
            if (err.message.includes("Duplicate column name")) {
                console.log("'telepon' column already exists.");
            } else {
                throw err;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
