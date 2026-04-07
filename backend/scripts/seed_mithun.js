const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const StudentDetail = require('../models/StudentDetail');

const mithunData = {
    name: 'MITHUN P P',
    student_id: '26EEE001',
    email: 'mithun26EEE@gmail.com',
    password: '26EEE001',
    mobile: '78100 78100',
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
        await StudentDetail.deleteOne({ student_id: '26EEE001' });
        
        // 2. Insert into master collection
        const masterStudent = new StudentDetail(mithunData);
        await masterStudent.save();
        console.log('Successfully seeded into master student_details');

        // 3. Insert into specific collection
        const collectionName = '26EEE001_student';
        const DynamicModel = mongoose.model(collectionName, StudentDetail.schema, collectionName);
        await DynamicModel.deleteOne({ student_id: '26EEE001' });
        const specificStudent = new DynamicModel(mithunData);
        await specificStudent.save();
        
        console.log(`Successfully seeded MITHUN P P into ${collectionName} collection`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
