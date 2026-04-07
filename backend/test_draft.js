const mongoose = require('mongoose');
const store = require('./config/storage');
const Mark = require('./models/Mark');

async function testDraftIsolation() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  console.log('Connected to MongoDB');

  const studentId = '26EEE001';
  const Model = Mark.model;

  // 1. Insert a DRAFT mark
  console.log('Inserting a DRAFT mark...');
  const draftMark = new Model({
    student_id: studentId,
    course_code: 'DRAFT101',
    course_name: 'Test Draft',
    course_type: 'Theory',
    mark: 50,
    semester: 'I',
    exam_type: 'Model',
    published: false
  });
  await draftMark.save();

  // 2. Fetch as Admin
  console.log('--- Fetching as Admin ---');
  const adminResults = await store.getMarksByStudent(studentId, {}, false);
  const foundInAdmin = adminResults.some(m => m.course_code === 'DRAFT101');
  console.log(`Admin sees DRAFT101: ${foundInAdmin}`);

  // 3. Fetch as Student
  console.log('--- Fetching as Student ---');
  const studentResults = await store.getMarksByStudent(studentId, {}, true);
  const foundInStudent = studentResults.some(m => m.course_code === 'DRAFT101');
  console.log(`Student sees DRAFT101: ${foundInStudent}`);

  // Cleanup
  await Model.deleteOne({ course_code: 'DRAFT101' });
  console.log('Draft mark cleaned up.');

  await mongoose.disconnect();
}

testDraftIsolation().catch(console.error);
