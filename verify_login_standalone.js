const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verify() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'huffadz_jatim'
        });

        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', ['hakimarx@gmail.com']);

        if (rows.length === 0) {
            console.log('User not found');
            return;
        }

        const user = rows[0];
        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password);

        const isValid = await bcrypt.compare('g4yung4n', user.password);
        console.log('Password Valid:', isValid);

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

verify();
