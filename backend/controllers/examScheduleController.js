const ExamSchedule = require('../models/ExamSchedule');

exports.saveSchedule = async (req, res) => {
    try {
        const { department, year, examType, subDept, entries } = req.body;

        if (!department || !year || !examType || !entries || entries.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Upsert logic: update if exists, otherwise create
        const schedule = await ExamSchedule.findOneAndUpdate(
            { department, year, examType },
            { subDept, entries, updated_at: Date.now() },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: 'Schedule saved successfully', schedule });
    } catch (err) {
        console.error('Error saving exam schedule:', err);
        res.status(500).json({ error: 'Failed to save exam schedule' });
    }
};

exports.publishSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await ExamSchedule.findByIdAndUpdate(
            id,
            { published: true, updated_at: Date.now() },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.status(200).json({ message: 'Schedule published successfully', schedule });
    } catch (err) {
        console.error('Error publishing exam schedule:', err);
        res.status(500).json({ error: 'Failed to publish exam schedule' });
    }
};

exports.unpublishSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid schedule ID' });
        }
        const schedule = await ExamSchedule.findByIdAndUpdate(
            id,
            { published: false, updated_at: Date.now() },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.status(200).json({ message: 'Schedule unpublished successfully', schedule });
    } catch (err) {
        console.error('Error unpublishing exam schedule:', err);
        res.status(500).json({ error: 'Failed to unpublish exam schedule: ' + err.message });
    }
};

exports.getSchedule = async (req, res) => {
    try {
        const { department, year, examType, published } = req.query;
        
        const query = {};
        if (department) query.department = department;
        if (year) query.year = year;
        if (examType) query.examType = examType;
        if (published === 'true') query.published = true;

        const schedules = await ExamSchedule.find(query).sort({ created_at: -1 });
        res.status(200).json(schedules);
    } catch (err) {
        console.error('Error fetching exam schedules:', err);
        res.status(500).json({ error: 'Failed to fetch exam schedules' });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ExamSchedule.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error('Error deleting exam schedule:', err);
        res.status(500).json({ error: 'Failed to delete exam schedule' });
    }
};
