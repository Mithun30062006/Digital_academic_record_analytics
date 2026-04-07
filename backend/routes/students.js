const express = require('express');
const router = express.Router();
const studentsCtrl = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

router.post('/login', studentsCtrl.login);
router.get('/filter', authenticate(['admin']), studentsCtrl.filterByDeptAndYear);

router.get('/', authenticate(['admin']), studentsCtrl.getAll);
router.get('/:id', authenticate(['admin','student']), studentsCtrl.getById);
router.post('/', authenticate(['admin']), studentsCtrl.create);
router.put('/:id', authenticate(['admin']), studentsCtrl.update);
router.delete('/:id', authenticate(['admin']), studentsCtrl.remove);

module.exports = router;
