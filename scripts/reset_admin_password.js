/**
 * Script untuk reset password admin di production
 * Jalankan di cPanel Terminal atau phpMyAdmin
 */

const bcrypt = require('bcryptjs');

// Password yang ingin di-set
const newPassword = 'Admin123!';

// Generate hash
async function generateHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    console.log('='.repeat(60));
    console.log('PASSWORD RESET SCRIPT');
    console.log('='.repeat(60));
    console.log('');
    console.log('Password baru:', newPassword);
    console.log('');
    console.log('Hash yang dihasilkan:');
    console.log(hash);
    console.log('');
    console.log('='.repeat(60));
    console.log('QUERY SQL UNTUK DIJALANKAN DI phpMyAdmin:');
    console.log('='.repeat(60));
    console.log('');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@hafizjatim.my.id';`);
    console.log('');
    console.log('='.repeat(60));
}

generateHash();
