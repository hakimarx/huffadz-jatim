const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('');
    console.log('SQL untuk insert:');
    console.log(`INSERT INTO public.users (email, password, nama, role, is_active, is_verified)`);
    console.log(`VALUES ('hakimarx@gmail.com', '${hash}', 'Admin Provinsi', 'admin_provinsi', TRUE, TRUE)`);
    console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}', is_active = TRUE;`);
}

generateHash();
