const mongoose = require('mongoose');
const Mark = require('./models/Mark');

async function dumpAll() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  const marks = await Mark.model.find({});
  console.log(`Total marks: ${marks.length}`);
  marks.forEach(m => {
    console.log(`Student: ${m.student_id}, Sem: ${m.semester}, Exam: ${m.exam_type}, Mark: ${m.mark}, Pub: ${m.published}`);
  });
  await mongoose.disconnect();
}
dumpAll().catch(console.error);
