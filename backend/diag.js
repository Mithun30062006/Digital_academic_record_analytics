
const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        
        const Mark = mongoose.connection.collection('marks');
        const Attendance = mongoose.connection.collection('attendance');
        const Student = mongoose.connection.collection('student_details');

        const allStudents = await Student.find({}).toArray();
        console.log('\n--- Students in DB ---');
        allStudents.forEach(s => console.log(`ID: ${s.student_id}, Name: ${s.name}`));

        for (const s of allStudents) {
            const sid = s.student_id;
            console.log(`\n>>> Diagnosis for ${s.name} (${sid}) <<<`);

            const attRecords = await Attendance.find({ student_id: sid }).toArray();
            console.log(`Attendance Records: ${attRecords.length}`);
            if (attRecords.length > 0) {
                console.log('Sample Attendance:', attRecords[0]);
            }

            const markRecords = await Mark.find({ student_id: sid }).toArray();
            console.log(`Mark Records: ${markRecords.length}`);
            const markSummary = markRecords.reduce((acc, m) => {
                const key = `${m.semester} - ${m.exam_type}`;
                acc[key] = (acc[key] || 0) + 1;
                acc[key + '_pub'] = (acc[key + '_pub'] || 0) + (m.published ? 1 : 0);
                return acc;
            }, {});
            console.log('Marks Details:', markSummary);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Diagnosis Failed:', err);
    }
}

diagnose();
