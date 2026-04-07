const express = require('express');
const router = express.Router();
const semesterCtrl = require('../controllers/semesterController');
const { authenticate } = require('../middleware/auth');

router.get('/', semesterCtrl.getSemesters);

module.exports = router;
