const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

// Upload a material for a course and unit
router.post('/upload', materialController.uploadMaterial);

// Get all materials for a course
router.get('/:courseId', materialController.getMaterials);

// Delete a material for a specific unit
router.delete('/:courseId/:unitNumber', materialController.deleteMaterial);

module.exports = router;
