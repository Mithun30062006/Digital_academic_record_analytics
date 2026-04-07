const mongoose = require('mongoose');
const store = require('./config/storage');

async function testDelete() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  console.log('Connected to MongoDB');

  // Exact parameters from Sample records
  const studentId = '26EEE001';
  const semester = 'I';
  const examType = 'Half 1';

  console.log(`Attempting to delete batch for ${studentId}, ${semester}, ${examType}`);
  const result = await store.removeMarksBatch(studentId, semester, examType);
  console.log('Delete result:', result);

  await mongoose.disconnect();
}

testDelete().catch(console.error);
