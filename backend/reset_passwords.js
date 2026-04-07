const mongoose = require('mongoose');

async function reset() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mini_project');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const result = await db.collection('student_details').updateMany(
            {},
            { $set: { password: 'Student@123' } }
        );

        console.log(`Updated ${result.modifiedCount} students with plaintext password 'Student@123'`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

reset();
