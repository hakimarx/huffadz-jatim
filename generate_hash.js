const bcrypt = require('bcryptjs');

async function generate() {
    const password = 'g4yung4n';
    const hash = await bcrypt.hash(password, 12);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

generate();
