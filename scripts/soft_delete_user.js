const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function softDeleteByEmail(email) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huffadz_jatim',
  });

  try {
    console.log(`Checking user with email: ${email}`);
    const [users] = await connection.execute('SELECT id, email, nama, is_active FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log('User not found. Nothing to do.');
      return;
    }

    const user = users[0];
    console.log('Before:', user);

    // Soft-delete user
    await connection.execute('UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?', [user.id]);

    // Unlink hafiz profiles
    const [hafizBefore] = await connection.execute('SELECT id, nik, nama, user_id FROM hafiz WHERE user_id = ?', [user.id]);
    console.log('Linked hafiz profiles (before):', hafizBefore);

    await connection.execute('UPDATE hafiz SET user_id = NULL WHERE user_id = ?', [user.id]);

    const [usersAfter] = await connection.execute('SELECT id, email, nama, is_active FROM users WHERE id = ?', [user.id]);
    console.log('After user:', usersAfter[0]);

    const [hafizAfter] = await connection.execute('SELECT id, nik, nama, user_id FROM hafiz WHERE nik IN (SELECT nik FROM hafiz WHERE id IS NOT NULL LIMIT 100) AND (user_id IS NULL OR user_id = 0) LIMIT 5');
    // Above is a simple probe — we'll also specifically check ones matching email/names
    const [hafizAfterSpecific] = await connection.execute('SELECT id, nik, nama, user_id FROM hafiz WHERE email = ? OR id IN (?)', [email, hafizBefore.map(h => h.id)]);

    console.log('Linked hafiz profiles (after) matching previous IDs/email:', hafizAfterSpecific);

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
    console.error('Usage: node scripts/soft_delete_user.js <email>');
    process.exit(1);
  }
  softDeleteByEmail(email).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
