const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/stats', authMiddleware.protect, dashboardController.getStats);
router.get('/usage', authMiddleware.protect, dashboardController.getUsage);

module.exports = router;
