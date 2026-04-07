const mongoose = require('mongoose');
const store = require('./config/storage');

async function testVisibility() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  console.log('Connected to MongoDB');

  const studentId = '26EEE001';

  console.log('--- Testing as Admin ---');
  const adminResults = await store.getMarksByStudent(studentId, {}, false);
  console.log(`Admin sees ${adminResults.length} marks.`);
  adminResults.forEach(m => console.log(`- ${m.course_code}: Published=${m.published}`));

  console.log('\n--- Testing as Student ---');
  const studentResults = await store.getMarksByStudent(studentId, {}, true);
  console.log(`Student sees ${studentResults.length} marks.`);
  studentResults.forEach(m => console.log(`- ${m.course_code}: Published=${m.published}`));

  await mongoose.disconnect();
}

testVisibility().catch(console.error);
