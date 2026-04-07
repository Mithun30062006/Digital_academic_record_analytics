const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const StudentDetail = require('../models/StudentDetail');

const balajiData = {
    name: 'BALAJI M J',
    student_id: '26CSE001',
    email: 'balaji26cse@gmail.com',
    password: '26CSE001',
    mobile: '82095 82095',
    batch: '2026-2030',
    semester: 'I',
    department: 'Computer Science and Enginnering',
    year: 'I'
};

async function seed() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        
        // 1. Clean up potential old data in main collection
        await StudentDetail.deleteOne({ student_id: '26CSE001' });
        
        // 2. Insert into master collection
        const masterStudent = new StudentDetail(balajiData);
        await masterStudent.save();
        console.log('Successfully seeded into master student_details');

        // 3. Insert into specific collection
        const collectionName = '26CSE001_student';
        const DynamicModel = mongoose.model(collectionName, StudentDetail.schema, collectionName);
        await DynamicModel.deleteOne({ student_id: '26CSE001' });
        const specificStudent = new DynamicModel(balajiData);
        await specificStudent.save();
        
        console.log(`Successfully seeded BALAJI M J into ${collectionName} collection`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
