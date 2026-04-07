const StudentDetail = require('./models/StudentDetail');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function fixDepts() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);

        const mapping = {
            'Computer Science and Enginnering': 'Computer Science and Engineering',
            'Electonics and Communication Enginnering': 'Electronics and Communication Engineering',
            'Computer Science & Engineering': 'Computer Science and Engineering',
            'Electronics & Communication Engineering': 'Electronics and Communication Engineering',
            'Electrical & Electronics Engineering': 'Electrical and Electronics Engineering',
            'Computer Science Engineering': 'Computer Science and Engineering'
        };

        for (const [oldName, newName] of Object.entries(mapping)) {
            const res = await StudentDetail.updateMany({ department: oldName }, { department: newName });
            if (res.modifiedCount > 0) {
                console.log(`Updated ${res.modifiedCount} students from "${oldName}" to "${newName}"`);
            }
        }

        console.log('Final check of departments:');
        const depts = await StudentDetail.distinct('department');
        console.log(depts);

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

fixDepts();
