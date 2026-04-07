const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const StudentDetail = require('../models/StudentDetail');

const rohithData = {
    name: 'ROHITH M',
    student_id: '26EEE002',
    email: 'rohith26eee@gmail.com',
    password: '26EEE002',
    mobile: '95968 95968',
    batch: '2026-2030',
    semester: 'I',
    department: 'Electrical and Electronics Engineering',
    year: 'I'
};

async function seed() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        
        // 1. Remove from master collection if exists
        await StudentDetail.deleteOne({ student_id: '26EEE002' });
        
        // 2. Insert into master collection
        const masterStudent = new StudentDetail(rohithData);
        await masterStudent.save();
        console.log('Successfully seeded into master student_details');

        // 3. Insert into specific collection
        const collectionName = '26EEE002_student';
        const DynamicModel = mongoose.model(collectionName, StudentDetail.schema, collectionName);
        await DynamicModel.deleteOne({ student_id: '26EEE002' });
        const specificStudent = new DynamicModel(rohithData);
        await specificStudent.save();
        
        console.log(`Successfully seeded ROHITH M into ${collectionName} collection`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
