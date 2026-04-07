const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate(['admin']), attendanceCtrl.saveAttendance);
router.get('/', authenticate(['admin', 'student']), attendanceCtrl.getAttendance);

module.exports = router;
