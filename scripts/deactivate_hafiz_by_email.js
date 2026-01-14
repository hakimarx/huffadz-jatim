const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function deactivate(email) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huffadz_jatim',
  });

  try {
    console.log(`Looking up hafiz with email: ${email}`);
    const [before] = await connection.execute('SELECT id, nik, nama, email, is_aktif FROM hafiz WHERE email = ?', [email]);
    if (before.length === 0) {
      console.log('No hafiz profile found for that email.');
      return;
    }
    console.log('Before:', before);

    await connection.execute('UPDATE hafiz SET is_aktif = 0 WHERE email = ?', [email]);

    const [after] = await connection.execute('SELECT id, nik, nama, email, is_aktif FROM hafiz WHERE email = ?', [email]);
    console.log('After:', after);

    console.log('Hafiz profile deactivated (is_aktif = 0).');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/deactivate_hafiz_by_email.js <email>');
    process.exit(1);
  }
  deactivate(email).catch(err => { console.error(err); process.exit(1); });
}
