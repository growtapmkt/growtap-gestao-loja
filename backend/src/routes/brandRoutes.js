const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, brandController.createBrand);
router.get('/', protect, brandController.getAllBrands);
router.put('/:id', protect, brandController.updateBrand);
router.delete('/:id', protect, brandController.deleteBrand);

module.exports = router;
