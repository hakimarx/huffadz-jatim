const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function find(term) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huffadz_jatim',
  });

  try {
    console.log(`Searching for term: ${term}`);
    const [users] = await connection.execute("SELECT id, email, nama, kabupaten_kota, is_active FROM users WHERE email LIKE ? OR nama LIKE ?", [`%${term}%`, `%${term}%`]);
    console.log('Users matching:', users);

    const [hafiz] = await connection.execute("SELECT id, nik, nama, email, kabupaten_kota, user_id FROM hafiz WHERE email LIKE ? OR nama LIKE ? OR kabupaten_kota LIKE ?", [`%${term}%`, `%${term}%`, `%${term}%`]);
    console.log('Hafiz matching:', hafiz);

    // Also search by region 'malang'
    if (term.toLowerCase() === 'malang') {
      const [hafizRegion] = await connection.execute("SELECT id, nik, nama, email, kabupaten_kota, user_id FROM hafiz WHERE kabupaten_kota LIKE ? LIMIT 50", [`%${term}%`]);
      console.log('Hafiz in region:', hafizRegion.length);
      console.log(hafizRegion.slice(0, 10));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  const term = process.argv[2];
  if (!term) {
    console.error('Usage: node scripts/find_user_hafiz.js <term>');
    process.exit(1);
  }
  find(term).catch(err => { console.error(err); process.exit(1); });
}
