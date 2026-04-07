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
        course_code: '123',
        course_name: 'Test 1',
        course_type: 'Theory',
        mark: '123'
      },
      {
        course_code: '456',
        course_name: 'Test 2',
        course_type: 'Lab',
        mark: '456'
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
