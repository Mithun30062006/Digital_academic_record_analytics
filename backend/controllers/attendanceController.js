const store = require('../config/storage');

exports.saveAttendance = async (req, res, next) => {
    try {
        const { records } = req.body;
        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Records array is required' });
        }

        // Validate records
        for (const record of records) {
            if (!record.student_id || !record.date || !record.session || !record.status) {
                return res.status(400).json({ message: 'Each record must have student_id, date, session, and status' });
            }
        }

        const result = await store.saveAttendance(records);
        res.json({ 
            message: 'Attendance saved successfully', 
            details: result 
        });
    } catch (err) {
        next(err);
    }
};

exports.getAttendance = async (req, res, next) => {
    try {
        const { date, student_ids } = req.query;
        const user = req.user;

        let ids = [];
        if (user.role === 'admin') {
            if (student_ids) {
                ids = Array.isArray(student_ids) ? student_ids : student_ids.split(',');
            }
        } else if (user.role === 'student') {
            // Use correct student_id from the login token
            ids = [user.student_id]; 
        }

        const records = await store.getAttendanceByFilter(date, ids);
        res.json(records);
    } catch (err) {
        next(err);
    }
};
