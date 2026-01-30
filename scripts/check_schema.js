
const { query } = require('./lib/db');

async function checkSchema() {
    try {
        console.log('🔍 Checking database schema...\n');

        // Check if settings table exists
        console.log('📋 Checking settings table...');
        try {
            const settingsResult = await query('DESCRIBE settings');
            console.log('✅ Settings table exists!');
            console.log('   Columns:', settingsResult.map(col => col.Field).join(', '));

            // Check if there's data
            const dataResult = await query('SELECT COUNT(*) as count FROM settings');
            console.log(`   Records: ${dataResult[0].count}`);

        } catch (settingsError) {
            console.log('❌ Settings table does NOT exist!');
            console.log('   Error:', settingsError.message);
            console.log('   Please run: node create_settings_table.js');
        }

        console.log('\n📋 Checking hafiz table...');
        const hafizResult = await query('DESCRIBE hafiz');
        console.log('✅ Hafiz table exists!');
        console.log('   Columns:', hafizResult.length);

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
    process.exit();
}

checkSchema();
