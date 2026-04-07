const store = require('./config/storage');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function verifyFinal() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);

        const testCases = [
            { dept: 'Electrical and Electronics Engineering', year: 'I' },
            { dept: 'Electronics and Communication Engineering', year: 'I' },
            { dept: 'Computer Science and Engineering', year: 'I' },
            { dept: 'Information Technology', year: 'I' }
        ];

        console.log('--- Final Filter Verification ---');
        for (const tc of testCases) {
            const students = await store.findStudentsByFilter(tc.dept, tc.year);
            console.log(`Filter [${tc.dept}, ${tc.year}]: Found ${students.length} students`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

verifyFinal();
