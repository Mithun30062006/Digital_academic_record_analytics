const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // Assuming it's available or use another way

async function simulateStudentFetch() {
  const API_URL = 'http://localhost:3000/api';
  const JWT_SECRET = 'secret'; // From auth.js default
  
  // Create a student token
  const token = jwt.sign({ 
    id: 'test_id', 
    role: 'student', 
    student_id: '26EEE001' 
  }, JWT_SECRET);

  console.log('Simulating student fetch for 26EEE001...');
  
  try {
    const response = await fetch(`${API_URL}/marks/student/26EEE001`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const marks = await response.json();
      console.log(`Student received ${marks.length} marks.`);
      marks.forEach(m => {
        console.log(`- Course: ${m.course_code}, Published: ${m.published}`);
      });
    } else {
      console.log('Fetch failed:', response.status);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

simulateStudentFetch();
