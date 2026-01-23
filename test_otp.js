const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

async function test() {
    const email = `testuser_${Date.now()}@ku.edu.np`;
    const password = 'password123';
    const name = 'Test User';

    try {
        console.log(`1. Registering ${email}...`);
        const regRes = await axios.post(`${BASE_URL}/auth/kumail`, {
            email, name, password, type: 'register'
        });

        console.log('Register Response:', regRes.data);
        if (!regRes.data.requiresVerification) {
            throw new Error('Registration should require verification');
        }

        console.log('--- Check server console for OTP ---');
        // Since I can't read the console easily from here, I'll have the user check it or 
        // I can look at the database directly if needed.

        // Wait for user to provide OTP if manual, or use a script to get it from DB.
        // For automation, I'll try to fetch it from DB.
        const db = require('./db');
        const [users] = await db.execute('SELECT verification_otp FROM users WHERE email = ?', [email]);
        const otp = users[0].verification_otp;
        console.log(`2. Found OTP in DB: ${otp}`);

        console.log('3. Verifying with correct OTP...');
        const verifyRes = await axios.post(`${BASE_URL}/auth/verify-registration`, {
            email, otp
        });
        console.log('Verify Response:', verifyRes.data);
        if (!verifyRes.data.token) {
            throw new Error('Verification should return a token');
        }

        console.log('4. Trying to login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/kumail`, {
            email, password, type: 'login'
        });
        console.log('Login Response:', loginRes.data);

        console.log('Verification successful!');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

test();
