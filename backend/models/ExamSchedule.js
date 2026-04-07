const mongoose = require('mongoose');

const examEntrySchema = new mongoose.Schema({
    date: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    venue: { type: String, required: true },
    session: { type: String, enum: ['FN', 'AN'], default: 'FN' }
});

const examScheduleSchema = new mongoose.Schema({
    department: { type: String, required: true },
    year: { type: String, required: true }, // Main role, interpreted as semester/year
    examType: { type: String, required: true },
    subDept: { type: String, default: 'Department of Engineering' },
    entries: [examEntrySchema],
    published: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'exam_schedule' });

// Ensure unique schedule for department, year, and exam type
examScheduleSchema.index({ department: 1, year: 1, examType: 1 }, { unique: true });

// Update updated_at on save
examScheduleSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
