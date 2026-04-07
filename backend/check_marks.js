const mongoose = require('mongoose');
const Mark = require('./models/Mark');

async function checkMarks() {
  await mongoose.connect('mongodb://localhost:27017/mini_project');
  console.log('Connected to MongoDB');

  const marks = await Mark.model.find({});
  console.log(`Total marks in unified collection: ${marks.length}`);
  
  if (marks.length > 0) {
    console.log('Sample records:');
    marks.slice(0, 5).forEach(m => {
      console.log(`Student: ${m.student_id}, Semester: ${m.semester}, Exam: ${m.exam_type}, Mark: ${m.mark}, Published: ${m.published}`);
    });
  }

  await mongoose.disconnect();
}

checkMarks().catch(console.error);
