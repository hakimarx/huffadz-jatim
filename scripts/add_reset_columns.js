const mysql = require('mysql2/promise');

async function addResetColumns() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'huffadz_jatim'
    });

    try {
        // Check if columns already exist
        const [columns] = await conn.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('reset_token')) {
            await conn.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
            console.log('✅ Added reset_token column');
        } else {
            console.log('ℹ️ reset_token column already exists');
        }

        if (!columnNames.includes('reset_token_expires')) {
            await conn.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL');
            console.log('✅ Added reset_token_expires column');
        } else {
            console.log('ℹ️ reset_token_expires column already exists');
        }

        // Show final columns
        const [finalColumns] = await conn.query('SHOW COLUMNS FROM users');
        console.log('\n📋 All user table columns:');
        finalColumns.forEach(c => console.log(`   - ${c.Field} (${c.Type})`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

addResetColumns();
