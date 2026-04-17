
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupTestData() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(uri);
        
        const Mark = mongoose.connection.collection('marks');
        const sid = '26EEE001';

        console.log(`Searching for test data for student ${sid}...`);
        const result = await Mark.deleteMany({ 
            student_id: sid, 
            course_code: 'TEST101' 
        });
        
        console.log(`Cleanup complete. Removed ${result.deletedCount} test records.`);

        await mongoose.connection.close();
    } catch (err) {
        console.error('Cleanup Failed:', err);
    }
}

cleanupTestData();
