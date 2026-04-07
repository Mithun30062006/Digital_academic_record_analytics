const express = require('express');
const router = express.Router();
const specialActionController = require('../controllers/specialActionController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists based on server.js imports

router.post('/', auth.authenticate(['admin']), specialActionController.saveSpecialAction);
router.get('/', auth.authenticate(['admin']), specialActionController.getSpecialAction);
router.delete('/', auth.authenticate(['admin']), specialActionController.deleteSpecialAction);


module.exports = router;
