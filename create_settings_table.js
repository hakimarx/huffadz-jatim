#!/usr/bin/env node

/**
 * Create Settings Table
 * Jalankan: node create_settings_table.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

async function createSettingsTable() {
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306'),
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'huffadz_jatim',
        });

        console.log('✓ Connected to database');

        // Read SQL file
        const sqlFilePath = path.join(__dirname, 'database', '10_create_settings_table.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('\n📋 Creating settings table...');

        // Execute the SQL
        await connection.execute(sqlContent);

        console.log('✓ Settings table created successfully!');

        // Verify table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'settings'");
        if (tables.length > 0) {
            console.log('✓ Table verification: settings table exists');

            // Check initial data
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM settings');
            console.log(`✓ Initial settings count: ${rows[0].count}`);
        } else {
            console.log('✗ Table verification failed');
        }

        console.log('\n🚀 Settings table is ready!');
        console.log('   You can now upload logo in settings.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
createSettingsTable();
