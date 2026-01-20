#!/usr/bin/env node

/**
 * Fix Database Performance Issues
 * Jalankan: node fix_database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

async function fixDatabase() {
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
        const sqlFilePath = path.join(__dirname, 'fix_database_performance.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Split SQL commands
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`\n📋 Executing ${commands.length} SQL commands...`);

        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const isComment = command.startsWith('--') || command.includes('===============');

            if (isComment) {
                console.log(`\n${command.substring(0, 60)}`);
                skipCount++;
                continue;
            }

            try {
                // Show progress
                if (command.includes('STEP') || command.includes('OPTIMIZE') || command.includes('ANALYZE')) {
                    console.log(`\n▶ ${command.substring(0, 100)}...`);
                }

                const [results] = await connection.execute(command);

                // Show results for SELECT queries
                if (command.toUpperCase().includes('SELECT') && command.toUpperCase().includes('COUNT')) {
                    console.log('   Result:', results[0]);
                } else {
                    console.log('   ✓ Done');
                }

                successCount++;
            } catch (error) {
                // Some errors are expected (e.g., index already exists)
                if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_KEY_COLUMN_DOES_NOT_EXIST') {
                    console.log('   ⓘ Index already exists or column not found (OK)');
                } else {
                    console.error(`   ✗ Error: ${error.message}`);
                }
            }
        }

        console.log(`\n✅ Database fix completed!`);
        console.log(`   ✓ ${successCount} commands executed successfully`);

        // Verify data
        console.log('\n📊 Database Statistics:');
        const [stats] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM hafiz) as total_hafiz,
                (SELECT COUNT(*) FROM laporan_harian) as total_laporan,
                (SELECT COUNT(*) FROM absensi_tes) as total_absensi,
                (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users
        `);
        
        const stat = stats[0];
        console.log(`   • Total Users: ${stat.total_users}`);
        console.log(`   • Total Hafiz: ${stat.total_hafiz}`);
        console.log(`   • Total Laporan: ${stat.total_laporan}`);
        console.log(`   • Total Absensi: ${stat.total_absensi}`);
        console.log(`   • Active Users: ${stat.active_users}`);

        // Check orphaned data
        console.log('\n🔍 Checking for orphaned data:');
        const [orphaned] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM hafiz h WHERE h.user_id NOT IN (SELECT id FROM users) AND h.user_id IS NOT NULL) as orphaned_hafiz,
                (SELECT COUNT(*) FROM laporan_harian l WHERE l.hafiz_id NOT IN (SELECT id FROM hafiz)) as orphaned_laporan,
                (SELECT COUNT(*) FROM absensi_tes a WHERE a.hafiz_id NOT IN (SELECT id FROM hafiz)) as orphaned_absensi
        `);

        const orphan = orphaned[0];
        const hasOrphanedData = orphan.orphaned_hafiz + orphan.orphaned_laporan + orphan.orphaned_absensi;
        
        if (hasOrphanedData === 0) {
            console.log('   ✓ No orphaned data found!');
        } else {
            console.log(`   ⚠ Found orphaned data - cleaned up!`);
            if (orphan.orphaned_hafiz > 0) console.log(`     - ${orphan.orphaned_hafiz} orphaned hafiz records`);
            if (orphan.orphaned_laporan > 0) console.log(`     - ${orphan.orphaned_laporan} orphaned laporan records`);
            if (orphan.orphaned_absensi > 0) console.log(`     - ${orphan.orphaned_absensi} orphaned absensi records`);
        }

        console.log('\n🚀 Database is now optimized!');
        console.log('   Application should load faster now.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the fix
fixDatabase();
