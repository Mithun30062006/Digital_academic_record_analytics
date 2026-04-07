const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/VS CODE/Mini_project_6/backend/.env' });

async function diagnose() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
            if (col.name.endsWith('_student')) {
                const doc = await db.collection(col.name).findOne();
                console.log(`  Sample: student_id=${doc?.student_id}, _id=${doc?._id}`);
            }
        }
        
        const masterCount = await db.collection('student_details').countDocuments();
        console.log(`Master student_details count: ${masterCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

diagnose();
