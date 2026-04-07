const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:3000/api';
const token = '...'; // I need a real token to test this properly if I want to check auth

async function simulateFetch() {
    try {
        console.log('--- Simulating Attendance Fetch ---');
        
        // 1. Get a token first
        console.log('Getting token...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            username: 'admin',
            password: 'admin123'
        }).catch(e => ({ data: { token: null }, error: e }));

        const myToken = loginRes.data?.token;
        if (!myToken) {
            console.error('Failed to get token for simulation. Login error:', loginRes.error?.response?.data || loginRes.error?.message);
            // Try testing without token just to see if route exists
        }

        const testCases = [
            { dept: 'Electrical and Electronics Engineering', year: 'I' },
            { dept: 'Electonics and Communication Enginnering', year: 'I' }
        ];

        for (const tc of testCases) {
            console.log(`\nTesting: ${tc.dept}, ${tc.year}`);
            try {
                const res = await axios.get(`${API_URL}/students/filter`, {
                    params: { department: tc.dept, year: tc.year },
                    headers: myToken ? { 'Authorization': `Bearer ${myToken}` } : {}
                });
                console.log('Status:', res.status);
                console.log('Data count:', Array.isArray(res.data) ? res.data.length : 'NOT AN ARRAY');
                if (res.data.length > 0) {
                    console.log('Sample student:', res.data[0]);
                }
            } catch (err) {
                console.error(`Fetch failed for ${tc.dept}:`, err.response?.data || err.message);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Simulation failed:', err);
        process.exit(1);
    }
}

simulateFetch();
