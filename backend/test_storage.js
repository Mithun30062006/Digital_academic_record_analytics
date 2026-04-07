const store = require('./config/storage');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function test() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Test finding Mithun
        const mithunNum = '26EEE001';
        const mithun = await store.findStudentByNumber(mithunNum);
        console.log(`Student ${mithunNum} found:`, mithun ? 'Yes' : 'No');
        if (mithun) {
            console.log('Mithun Mongo _id:', mithun.id);
            const retrieved = await store.getStudentById(mithun.id, mithunNum);
            console.log('Retrieved via getStudentById:', retrieved ? 'Yes' : 'No');
            if (retrieved) console.log('Retrieved Name:', retrieved.name);
        }

        // Test finding Rohith
        const rohithNum = '26EEE002';
        const rohith = await store.findStudentByNumber(rohithNum);
        console.log(`Student ${rohithNum} found:`, rohith ? 'Yes' : 'No');
        if (rohith) {
            console.log('Rohith Mongo _id:', rohith.id);
            const retrieved = await store.getStudentById(rohith.id, rohithNum);
            console.log('Retrieved via getStudentById:', retrieved ? 'Yes' : 'No');
            if (retrieved) console.log('Retrieved Name:', retrieved.name);
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
