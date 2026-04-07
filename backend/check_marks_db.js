const mongoose = require('mongoose');
require('dotenv').config();

async function checkMarks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_project');
        console.log('Connected to DB');
        
        const Mark = require('./models/Mark');
        const marks = await Mark.model.find({}).limit(10);
        
        console.log('Total marks count:', await Mark.model.countDocuments());
        console.log('Recent marks (first 10):');
        console.log(JSON.stringify(marks, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMarks();
