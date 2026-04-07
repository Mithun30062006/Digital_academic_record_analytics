const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate(['admin']), examScheduleController.saveSchedule);
router.get('/', examScheduleController.getSchedule);
router.patch('/:id/publish', authenticate(['admin']), examScheduleController.publishSchedule);
router.patch('/:id/unpublish', authenticate(['admin']), examScheduleController.unpublishSchedule);
router.delete('/:id', authenticate(['admin']), examScheduleController.deleteSchedule);

module.exports = router;
