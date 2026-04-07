const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:3000/api';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

async function testAttendanceSave() {
    try {
        console.log('--- Testing Attendance Save API ---');

        // 1. Login to get token
        console.log('Logging in...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/admin/login`, {
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD
            });
            token = loginRes.data.token;
            console.log('Login successful.');
        } catch (err) {
            console.error('Login failed. Please check ADMIN_USERNAME/ADMIN_PASSWORD in script.', err.response?.data || err.message);
            return;
        }

        // 2. Prepare test data
        const date = new Date().toISOString().split('T')[0];
        const records = [
            { student_id: 'S101', date, session: 1, status: 'present' },
            { student_id: 'S101', date, session: 2, status: 'absent' },
            { student_id: 'S102', date, session: 1, status: 'present' },
            { student_id: 'S102', date, session: 4, status: 'present' }
        ];

        // 3. Save attendance
        console.log(`Saving ${records.length} records...`);
        const saveRes = await axios.post(`${API_URL}/attendance`, 
            { records },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        console.log('Save status:', saveRes.status);
        console.log('Save message:', saveRes.data.message);
        console.log('Details:', saveRes.data.details);

        if (saveRes.status === 200) {
            console.log('SUCCESS: Attendance saved correctly.');
        } else {
            console.error('FAILURE: Unexpected status code.');
        }

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

testAttendanceSave();
