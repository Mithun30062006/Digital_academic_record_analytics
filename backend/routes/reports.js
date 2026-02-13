const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// Admin-only report endpoints
router.get('/summary', authenticate(['admin']), reportCtrl.studentSummary);
router.get('/topper', authenticate(['admin']), reportCtrl.topper);
router.get('/subject-topper/:subjectId', authenticate(['admin']), reportCtrl.subjectTopper);
router.get('/passfail', authenticate(['admin']), reportCtrl.passFail);
router.get('/subject-stats/:subjectId', authenticate(['admin']), reportCtrl.subjectStats);

module.exports = router;
