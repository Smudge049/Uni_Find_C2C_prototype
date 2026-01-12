const db = require('../db');

async function checkDatabase() {
    try {
        const [dbNameResult] = await db.execute('SELECT DATABASE() as db_name');
        const dbName = dbNameResult[0].db_name;
        console.log('Current database:', dbName);

        const [tables] = await db.execute('SHOW TABLES');
        console.log('Tables in database:');
        tables.forEach(t => {
            console.log(`- ${Object.values(t)[0]}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error checking database:', err);
        process.exit(1);
    }
}

checkDatabase();
