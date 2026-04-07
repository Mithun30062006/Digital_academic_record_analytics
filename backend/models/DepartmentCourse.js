const mongoose = require('mongoose');

const departmentCourseSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    credit: { type: Number, required: true },
    faculty: { type: String, required: true },
    departmentId: { type: String, required: true },
    semesterId: { type: String, required: true },
    units: [{
        unitNumber: { type: Number, required: true },
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now }
    }],
    created_at: { type: Date, default: Date.now }
});

// Compound index for faster filtering
departmentCourseSchema.index({ departmentId: 1, semesterId: 1 });

module.exports = mongoose.model('DepartmentCourse', departmentCourseSchema, 'department_course');
