const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware.protect, settingsController.getSettings);
router.put('/', authMiddleware.protect, settingsController.updateSettings);

module.exports = router;
