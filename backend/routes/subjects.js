const express = require('express');
const router = express.Router();
const subjectsCtrl = require('../controllers/subjectController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate(['admin','student']), subjectsCtrl.getAll);
router.get('/:id', authenticate(['admin','student']), subjectsCtrl.getById);
router.post('/', authenticate(['admin']), subjectsCtrl.create);
router.put('/:id', authenticate(['admin']), subjectsCtrl.update);
router.delete('/:id', authenticate(['admin']), subjectsCtrl.remove);

module.exports = router;
