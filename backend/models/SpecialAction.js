const mongoose = require('mongoose');

const specialActionSchema = new mongoose.Schema({
    year: { 
        type: String, 
        required: true, 
        enum: ['I', 'II', 'III', 'IV', 'ALL'] 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    reason: { 
        type: String, 
        required: true, 
        enum: ['Sunday', 'Leave', 'Semester'] 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'special_actions' });

// Ensure we only have one action per year per date
specialActionSchema.index({ year: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SpecialAction', specialActionSchema);
