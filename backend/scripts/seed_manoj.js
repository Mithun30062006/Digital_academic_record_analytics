const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const StudentDetail = require('../models/StudentDetail');

const manojData = {
    name: 'MANOJ S',
    student_id: '26ECE001',
    email: 'manoj26ece@gmail.com',
    password: '26ECE001',
    mobile: '63720 63720',
    batch: '2026-2030',
    semester: 'I',
    department: 'Electonics and Communication Enginnering',
    year: 'I'
};

async function seed() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        
        // 1. Clean up potential old data in main collection
        await StudentDetail.deleteOne({ student_id: '26ECE001' });
        
        // 2. Insert into master collection
        const masterStudent = new StudentDetail(manojData);
        await masterStudent.save();
        console.log('Successfully seeded into master student_details');

        // 3. Insert into specific collection
        const collectionName = '26ECE001_student';
        const DynamicModel = mongoose.model(collectionName, StudentDetail.schema, collectionName);
        await DynamicModel.deleteOne({ student_id: '26ECE001' });
        const specificStudent = new DynamicModel(manojData);
        await specificStudent.save();
        
        console.log(`Successfully seeded MANOJ S into ${collectionName} collection`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
