const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

router.post('/register', adminCtrl.register);
router.post('/login', adminCtrl.login);

// example protected route
router.get('/me', authenticate(['admin']), adminCtrl.me);

module.exports = router;
