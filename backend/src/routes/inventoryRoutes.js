const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/intelligent', protect, inventoryController.getIntelligentInventory);

module.exports = router;
