const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    date: { type: String, required: true }, // Store as YYYY-MM-DD
    session: { type: Number, required: true, enum: [1, 2, 3, 4] },
    status: { type: String, required: true, enum: ['present', 'absent'] },
    created_at: { type: Date, default: Date.now }
}, { collection: 'attendance' });

// Add index for faster queries
attendanceSchema.index({ student_id: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
