#!/usr/bin/env node

/**
 * Check if Settings Table Exists
 * Jalankan: node check_settings_table.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

async function checkSettingsTable() {
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

        // Check if settings table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'settings'");

        if (tables.length > 0) {
            console.log('✓ Settings table exists!');

            // Check table structure
            const [columns] = await connection.execute('DESCRIBE settings');
            console.log('\n📋 Table structure:');
            columns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `(${col.Key})` : ''}`);
            });

            // Check data
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM settings');
            console.log(`\n📊 Records count: ${rows[0].count}`);

            if (rows[0].count > 0) {
                const [data] = await connection.execute('SELECT `key`, `value`, `description` FROM settings LIMIT 5');
                console.log('\n📋 Sample data:');
                data.forEach(row => {
                    console.log(`   ${row.key}: ${row.value || '(null)'} - ${row.description}`);
                });
            }

            console.log('\n✅ Settings table is ready for use!');
        } else {
            console.log('❌ Settings table does not exist!');
            console.log('   Please run: node create_settings_table.js');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the check
checkSettingsTable();
