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
            // Fetch current student_id from database using the immutable internal ID
            // in the token. This prevents issues if the student_id string in the token is stale.
            const student = await store.getStudentById(user.id);
            ids = [student ? student.student_id : user.student_id]; 
        }

        const records = await store.getAttendanceByFilter(date, ids);
        console.log(`[Attendance] Fetched ${records.length} records for IDs: [${ids.join(', ')}] on date: ${date || 'All'}`);
        
        // Prevent browser caching
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });

        res.json(records);
    } catch (err) {
        next(err);
    }
};
