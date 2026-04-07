const store = require('./backend/config/storage');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function testFilter() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);

        const testCases = [
            { dept: 'Electrical and Electronics Engineering', year: 'I' },
            { dept: 'Computer Science and Enginnering', year: 'I' },
            { dept: 'Electonics and Communication Enginnering', year: 'I' },
            { dept: 'Information Technology', year: 'I' }
        ];

        for (const tc of testCases) {
            console.log(`\nTesting filter: Dept="${tc.dept}", Year="${tc.year}"`);
            const students = await store.findStudentsByFilter(tc.dept, tc.year);
            console.log(`Found ${students.length} students:`);
            students.forEach(s => console.log(` - ${s.name} (${s.student_id})`));
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testFilter();
