const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function hash(p) { return bcrypt.hashSync(p, 10); }

const adminsPath = path.join(dataDir, 'admins.json');
const studentsPath = path.join(dataDir, 'students.json');
const subjectsPath = path.join(dataDir, 'subjects.json');
const marksPath = path.join(dataDir, 'marks.json');

const admins = [
  { id: 'a', username: 'admin', password_hash: hash('a'), full_name: 'Default Admin', email: 'admin@example.com', created_at: new Date().toISOString() }
];

const students = [
  { id: 1, student_number: 'S001', first_name: 'Student', last_name: 'One', dob: null, gender: 'O', email: 'student1@example.com', class_name: '10A', enrollment_date: null, status: 'active', password_hash: hash('Student@123'), created_at: new Date().toISOString() }
];

const subjects = [];
const marks = [];

fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));
fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));
fs.writeFileSync(subjectsPath, JSON.stringify(subjects, null, 2));
fs.writeFileSync(marksPath, JSON.stringify(marks, null, 2));

console.log('Seeded data in', dataDir);
console.log('Admin login: username=admin password=a (id: a)');
console.log('Student login: student_number=S001 password=Student@123');
