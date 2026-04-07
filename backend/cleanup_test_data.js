const Attendance = require('./models/Attendance');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function cleanup() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);

        const testIds = ['TEST001', 'TEST002'];
        const result = await Attendance.deleteMany({ student_id: { $in: testIds } });
        
        console.log(`Successfully removed ${result.deletedCount} test records from 'attendance' collection.`);

        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
