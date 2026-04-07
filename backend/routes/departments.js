const express = require('express');
const router = express.Router();
const departmentCtrl = require('../controllers/departmentController');
const { authenticate } = require('../middleware/auth');

router.get('/all', authenticate(['admin', 'student']), departmentCtrl.getDepartmentsBySemester);
router.get('/:semesterId', authenticate(['admin', 'student']), departmentCtrl.getDepartmentsBySemester);
router.get('/:departmentId/courses', authenticate(['admin', 'student']), departmentCtrl.getCoursesByDepartment);
router.post('/courses', authenticate(['admin']), departmentCtrl.createCourse);
router.put('/courses/:id', authenticate(['admin']), departmentCtrl.updateCourse);
router.delete('/courses/:id', authenticate(['admin']), departmentCtrl.deleteCourse);

module.exports = router;
