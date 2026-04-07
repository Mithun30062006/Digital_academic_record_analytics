const express = require('express');
const router = express.Router();
const marksCtrl = require('../controllers/marksController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate(['admin']), marksCtrl.getAll);
router.get('/student/:id', authenticate(['admin','student']), marksCtrl.getByStudent);
router.get('/subject/:id', authenticate(['admin','student']), marksCtrl.getBySubject);
router.post('/', authenticate(['admin']), marksCtrl.create);
router.post('/save-batch', authenticate(['admin']), marksCtrl.saveBatch);
router.delete('/batch-delete', authenticate(['admin']), marksCtrl.removeBatch);

router.put('/:id', authenticate(['admin']), marksCtrl.update);
router.delete('/:id', authenticate(['admin']), marksCtrl.remove);

module.exports = router;
