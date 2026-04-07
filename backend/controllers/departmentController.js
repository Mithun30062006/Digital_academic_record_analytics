const DepartmentCourse = require('../models/DepartmentCourse');

const departments = [
    { id: 'eee', name: 'Electrical and Electronics Engineering', icon: 'fa-bolt' },
    { id: 'ece', name: 'Electronics and Communication Engineering', icon: 'fa-microchip' },
    { id: 'cse', name: 'Computer Science and Engineering', icon: 'fa-laptop-code' },
    { id: 'it', name: 'Information Technology', icon: 'fa-network-wired' }
];

exports.getDepartmentsBySemester = (req, res) => {
    try {
        const { semesterId } = req.params;
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

exports.getCoursesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { semesterId } = req.query;
        
        const dept = departments.find(d => d.id === departmentId);
        const departmentName = dept ? dept.name : 'Unknown Department';

        const query = { departmentId };
        if (semesterId) {
            query.semesterId = semesterId;
        }

        const courses = await DepartmentCourse.find(query).sort({ code: 1 });

        res.json({
            departmentName,
            courses
        });
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { code, name, type, credit, faculty, departmentId, semesterId } = req.body;
        
        if (!code || !name || !type || credit === undefined || !faculty || !departmentId || !semesterId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newCourse = new DepartmentCourse({
            code, name, type, credit, faculty, departmentId, semesterId
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ error: err.message || 'Failed to create course' });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, type, credit, faculty } = req.body;

        const updatedCourse = await DepartmentCourse.findByIdAndUpdate(
            id,
            { code, name, type, credit, faculty },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ error: err.message || 'Failed to update course' });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await DepartmentCourse.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ error: err.message || 'Failed to delete course' });
    }
};
