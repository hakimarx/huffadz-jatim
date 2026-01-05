
const { query } = require('./lib/db');

async function checkSchema() {
    try {
        const result = await query('DESCRIBE hafiz');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error);
    }
    process.exit();
}

checkSchema();
