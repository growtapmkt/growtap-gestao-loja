const express = require('express');
const router = express.Router();
const characteristicController = require('../controllers/characteristicController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, characteristicController.createCharacteristic);
router.get('/', protect, characteristicController.getAllCharacteristics);
router.put('/:id', protect, characteristicController.updateCharacteristic);
router.delete('/:id', protect, characteristicController.deleteCharacteristic);

module.exports = router;
