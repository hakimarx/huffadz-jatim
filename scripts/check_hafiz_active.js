const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check(email) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huffadz_jatim',
  });

  try {
    const [rows] = await connection.execute('SELECT COUNT(*) as total_active FROM hafiz WHERE email = ? AND is_aktif = 1', [email]);
    console.log('Active count for', email, rows[0].total_active);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/check_hafiz_active.js <email>');
    process.exit(1);
  }
  check(email).catch(err => { console.error(err); process.exit(1); });
}
