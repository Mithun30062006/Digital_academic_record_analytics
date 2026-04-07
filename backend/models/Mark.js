const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    course_code: { type: String, required: true },
    course_name: { type: String },
    course_type: { type: String, enum: ['Theory', 'Lab'] },
    mark: { type: Number, required: true },
    semester: { type: String },
    exam_type: { type: String },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

module.exports = {
    schema: markSchema,
    model: mongoose.model('Mark', markSchema, 'marks') // Unified collection name
};
