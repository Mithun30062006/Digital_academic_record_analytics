
const mongoose = require('mongoose');
require('dotenv').config();
const storage = require('./config/storage');

async function testSideEffects() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(uri);
        
        const Attendance = mongoose.connection.collection('attendance');
        const sid = '26EEE001';

        console.log('--- BEFORE ACTION ---');
        const countBefore = await Attendance.countDocuments({ student_id: sid });
        console.log(`Attendance records for ${sid}: ${countBefore}`);

        console.log('\n--- ACTION: Saving Marks ---');
        await storage.saveMarksBatch(sid, 'I', 'Test Exam', [
            { course_code: 'TEST101', mark: 85, course_name: 'Test Course', course_type: 'Theory' }
        ], true);
        console.log('Marks saved.');

        console.log('\n--- AFTER ACTION ---');
        const countAfter = await Attendance.countDocuments({ student_id: sid });
        console.log(`Attendance records for ${sid}: ${countAfter}`);

        if (countBefore !== countAfter) {
            console.error('CRITICAL: Attendance changed! Difference:', countAfter - countBefore);
        } else {
            console.log('SUCCESS: Attendance did NOT change.');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testSideEffects();
