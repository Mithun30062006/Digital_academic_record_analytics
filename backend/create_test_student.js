const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mini_project').then(async () => {
    const hash = await bcrypt.hash('Student@123', 10);
    await mongoose.connection.db.collection('student_details').updateOne(
        { student_id: 'S001' },
        { $set: { name: 'Test Student', student_id: 'S001', email: 'test@example.com', password: hash, mobile: '1234567890' } },
        { upsert: true }
    );
    console.log('created S001');
    process.exit(0);
});
