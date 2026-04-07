const store = require('./backend/config/storage');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function test() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_project';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Test finding Mithun
        const mithun = await store.findStudentByNumber('26EEE001');
        console.log('Mithun found:', mithun ? 'Yes' : 'No');
        if (mithun) {
            console.log('Mithun ID:', mithun.id);
            const retrieved = await store.getStudentById(mithun.id, '26EEE001');
            console.log('Retrieved via getStudentById:', retrieved ? 'Yes' : 'No');
            if (retrieved) console.log('Retrieved Name:', retrieved.name);
        }

        // Test finding Rohith
        const rohith = await store.findStudentByNumber('26EEE002');
        console.log('Rohith found:', rohith ? 'Yes' : 'No');
        if (rohith) {
            console.log('Rohith ID:', rohith.id);
            const retrieved = await store.getStudentById(rohith.id, '26EEE002');
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
