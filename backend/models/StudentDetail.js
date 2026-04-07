const mongoose = require('mongoose');

const studentDetailSchema = new mongoose.Schema({
    name: { type: String, required: true },
    student_id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    batch: { type: String },
    semester: { type: String },
    department: { type: String },
    year: { type: String },
    created_at: { type: Date, default: Date.now }
}, { collection: 'student_details' });

module.exports = mongoose.model('StudentDetail', studentDetailSchema);
