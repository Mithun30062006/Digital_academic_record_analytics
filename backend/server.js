const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const marksRoutes = require('./routes/marks');
const reportsRoutes = require('./routes/reports');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.json({ message: 'Digital Academic Records API' }));

app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/semesters', require('./routes/semesters'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/special-actions', require('./routes/specialActions'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/exam-schedule', require('./routes/examSchedule'));


app.use((err, req, res, next) => {
  console.error('SERVER ERROR CAUGHT:', err);
  require('fs').appendFileSync('backend_error.log', new Date().toISOString() + ' - ' + (err.stack || err) + '\n');
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.testConnection();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
