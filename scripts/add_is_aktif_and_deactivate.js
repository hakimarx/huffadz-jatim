const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run(email) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huffadz_jatim',
  });

  try {
    console.log('Ensuring is_aktif column exists...');
    // Add column if not exists (MySQL doesn't support IF NOT EXISTS for ADD COLUMN in older versions, so guard with check)
    const [cols] = await connection.execute("SHOW COLUMNS FROM hafiz LIKE 'is_aktif'");
    if (cols.length === 0) {
      await connection.execute('ALTER TABLE hafiz ADD COLUMN is_aktif BOOLEAN DEFAULT 1');
      console.log('Column added.');
    } else {
      console.log('Column already exists.');
    }

    // Ensure existing rows have value
    await connection.execute('UPDATE hafiz SET is_aktif = 1 WHERE is_aktif IS NULL');

    console.log(`Deactivating hafiz with email ${email}`);
    const [before] = await connection.execute('SELECT id, nik, nama, email, is_aktif FROM hafiz WHERE email = ?', [email]);
    console.log('Before:', before);

    if (before.length === 0) {
      console.log('No hafiz with that email. Nothing to do.');
      return;
    }

    await connection.execute('UPDATE hafiz SET is_aktif = 0 WHERE email = ?', [email]);

    const [after] = await connection.execute('SELECT id, nik, nama, email, is_aktif FROM hafiz WHERE email = ?', [email]);
    console.log('After:', after);
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/add_is_aktif_and_deactivate.js <email>');
    process.exit(1);
  }
  run(email).catch(err => { console.error(err); process.exit(1); });
}
