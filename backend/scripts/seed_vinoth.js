const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const StudentDetail = require('../models/StudentDetail');

const vinothData = {
    name: 'VINOTH M',
    student_id: '26IT001',
    email: 'vinoth26it@gmail.com',
    password: '26IT001',
    mobile: '99425 99425',
    batch: '2026-2030',
    semester: 'I',
    department: 'Information Technology',
    year: 'I'
};

async function seed() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        
        // 1. Clean up potential old data in main collection
        await StudentDetail.deleteOne({ student_id: '26IT001' });
        
        // 2. Insert into master collection
        const masterStudent = new StudentDetail(vinothData);
        await masterStudent.save();
        console.log('Successfully seeded into master student_details');

        // 3. Insert into specific collection
        const collectionName = '26IT001_student';
        const DynamicModel = mongoose.model(collectionName, StudentDetail.schema, collectionName);
        await DynamicModel.deleteOne({ student_id: '26IT001' });
        const specificStudent = new DynamicModel(vinothData);
        await specificStudent.save();
        
        console.log(`Successfully seeded VINOTH M into ${collectionName} collection`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
