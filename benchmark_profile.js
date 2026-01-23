const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function benchmark() {
    // We need a valid token for these tests. 
    // I'll grab one from the DB or just use a known user.
    const db = require('./db');
    const [users] = await db.execute('SELECT id, email, name FROM users WHERE is_verified = 1 LIMIT 1');
    if (users.length === 0) {
        console.log('No verified users found to test with.');
        process.exit(1);
    }
    const user = users[0];
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('./middleware/auth');
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);

    const api = axios.create({
        baseURL: BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    try {
        console.log('Benchmarking /dashboard...');
        let start = Date.now();
        await api.get('/dashboard');
        console.log(`/dashboard took ${Date.now() - start}ms`);

        console.log('Benchmarking /my-items...');
        start = Date.now();
        await api.get('/my-items');
        console.log(`/my-items took ${Date.now() - start}ms`);

        process.exit(0);
    } catch (err) {
        console.error('Benchmark failed:', err.message);
        process.exit(1);
    }
}

benchmark();
