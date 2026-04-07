const db = require('./config/db');
const store = require('./config/storage');
require('dotenv').config();

async function test() {
  try {
    await db.testConnection();
    console.log('Testing saveMarksBatch with 2 records...');
    
    const studentId = '2028201001'; // Use an existing ID or example
    const semester = 'I';
    const examType = 'HALF 1';
    const records = [
      {
        course_code: 'CSE301',
        course_name: 'Data Structures',
        course_type: 'Theory',
        mark: '95'
      },
      {
        course_code: 'CSE302',
        course_name: 'Algorithms',
        course_type: 'Theory',
        mark: '88'
      }
    ];

    const result = await store.saveMarksBatch(studentId, semester, examType, records);
    console.log('Result:', result);
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR CAPTURED:', err);
    process.exit(1);
  }
}

test();
