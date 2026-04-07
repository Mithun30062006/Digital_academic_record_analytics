const store = require('./config/storage');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function testRetrieval() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);

        const date1 = '2026-03-14';
        const date2 = '2026-03-15';
        const studentIds = ['TEST001', 'TEST002'];

        console.log('--- Testing Persistence and Isolation ---');

        // 1. Save for Date 1
        const records1 = [
            { student_id: 'TEST001', date: date1, session: 1, status: 'present' },
            { student_id: 'TEST002', date: date1, session: 1, status: 'absent' }
        ];
        console.log(`Saving records for ${date1}...`);
        await store.saveAttendance(records1);

        // 2. Save for Date 2
        const records2 = [
            { student_id: 'TEST001', date: date2, session: 1, status: 'absent' }
        ];
        console.log(`Saving records for ${date2}...`);
        await store.saveAttendance(records2);

        // 3. Fetch for Date 1
        console.log(`Fetching records for ${date1}...`);
        const result1 = await store.getAttendanceByFilter(date1, studentIds);
        console.log(`Found ${result1.length} records for ${date1}.`);
        result1.forEach(r => console.log(` - ${r.student_id}: ${r.status}`));

        // 4. Fetch for Date 2
        console.log(`Fetching records for ${date2}...`);
        const result2 = await store.getAttendanceByFilter(date2, studentIds);
        console.log(`Found ${result2.length} records for ${date2}.`);
        result2.forEach(r => console.log(` - ${r.student_id}: ${r.status}`));

        // 5. Verify Isolation
        const test001_date1 = result1.find(r => r.student_id === 'TEST001' && r.date === date1);
        const test001_date2 = result2.find(r => r.student_id === 'TEST001' && r.date === date2);

        if (test001_date1.status === 'present' && test001_date2.status === 'absent') {
            console.log('SUCCESS: Date isolation verified.');
        } else {
            console.error('FAILURE: Data mismatch between dates.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testRetrieval();
