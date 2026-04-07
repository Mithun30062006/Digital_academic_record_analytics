const SpecialAction = require('../models/SpecialAction');

exports.saveSpecialAction = async (req, res) => {
    try {
        const { year, date, reason } = req.body;
        
        if (!year || !date || !reason) {
            return res.status(400).json({ message: 'Year, date, and reason are required' });
        }

        // Upsert the special action (update if exists, otherwise create)
        const action = await SpecialAction.findOneAndUpdate(
            { year, date },
            { reason, created_at: Date.now() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Special action saved successfully', action });
    } catch (err) {
        console.error('Error saving special action:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSpecialAction = async (req, res) => {
    try {
        const { year, date } = req.query;
        
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }

        const query = {
            $or: [
                { year: year },
                { year: 'ALL' }
            ]
        };

        if (date) {
            query.date = date;
            const action = await SpecialAction.findOne(query).sort({ year: 1 });
            return res.status(200).json(action);
        } else {
            // Return all actions for the year
            const actions = await SpecialAction.find(query);
            return res.status(200).json(actions);
        }
    } catch (err) {
        console.error('Error fetching special action:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.deleteSpecialAction = async (req, res) => {
    try {
        const { year, date } = req.query;
        
        if (!year || !date) {
            return res.status(400).json({ message: 'Year and date are required' });
        }

        const result = await SpecialAction.findOneAndDelete({ year, date });

        if (!result) {
            return res.status(404).json({ message: 'Special action not found' });
        }

        res.status(200).json({ message: 'Special action deleted successfully' });
    } catch (err) {
        console.error('Error deleting special action:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

