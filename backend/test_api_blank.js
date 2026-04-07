const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

async function testFrontendCall() {
  const batchData = {
    student_id: '2028201001',
    semester: 'I',
    exam_type: 'HALF 1',
    records: [
      {
        course_code: 'CSE301',
        course_name: 'Data Structures',
        course_type: 'Theory',
        mark: '90'
      },
      {
        course_code: 'CSE999',
        course_name: '', // The user adds a second subject but doesn't type course name
        course_type: 'Theory',
        mark: '85'
      }
    ]
  };

  try {
    const res = await fetch('http://localhost:3000/api/marks/save-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(batchData)
    });
    const data = await res.text();
    console.log('Status:', res.status, 'Data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testFrontendCall();
