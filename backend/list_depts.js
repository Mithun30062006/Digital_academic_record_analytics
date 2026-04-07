const StudentDetail = require('./models/StudentDetail');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function listDepts() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);

        const depts = await StudentDetail.distinct('department');
        console.log('Unique Departments in DB:', depts);

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

listDepts();
