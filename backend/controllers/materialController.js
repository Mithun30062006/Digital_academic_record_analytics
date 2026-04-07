const DepartmentCourse = require('../models/DepartmentCourse');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/materials';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed types: PDF, Word, PowerPoint, Text, ZIP'));
        }
    }
}).single('material');

// Upload or Update Material
exports.uploadMaterial = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const { courseId, unitNumber } = req.body;
            if (!courseId || !unitNumber) {
                return res.status(400).json({ error: 'Course ID and Unit Number are required' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const unitNum = parseInt(unitNumber);
            const course = await DepartmentCourse.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }

            // Check if unit material already exists
            const existingUnitIndex = course.units.findIndex(u => u.unitNumber === unitNum);

            if (existingUnitIndex > -1) {
                // Remove old file
                const oldFilePath = course.units[existingUnitIndex].filePath;
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
                // Update existing unit
                course.units[existingUnitIndex] = {
                    unitNumber: unitNum,
                    fileName: req.file.originalname,
                    filePath: req.file.path.replace(/\\/g, '/'),
                    uploadDate: new Date()
                };
            } else {
                // Add new unit
                course.units.push({
                    unitNumber: unitNum,
                    fileName: req.file.originalname,
                    filePath: req.file.path.replace(/\\/g, '/'),
                    uploadDate: new Date()
                });
            }

            await course.save();
            res.status(200).json({ message: 'Material uploaded successfully', material: course });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Failed to upload material' });
        }
    });
};

// Get Materials for a Course
exports.getMaterials = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await DepartmentCourse.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ units: course.units || [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};

// Delete a specific unit material
exports.deleteMaterial = async (req, res) => {
    try {
        const { courseId, unitNumber } = req.params;
        const unitNum = parseInt(unitNumber);
        
        const course = await DepartmentCourse.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const unitIndex = course.units.findIndex(u => u.unitNumber === unitNum);
        if (unitIndex === -1) {
            return res.status(404).json({ error: 'Unit material not found' });
        }

        // Delete file from storage
        const filePath = course.units[unitIndex].filePath;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from array
        course.units.splice(unitIndex, 1);
        await course.save();

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
