const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.protect, saleController.createSale);
router.get('/', authMiddleware.protect, saleController.getAllSales);
router.put('/:id', authMiddleware.protect, saleController.updateSale);
router.put('/:id/pay', authMiddleware.protect, saleController.paySale);
router.delete('/:id', authMiddleware.protect, saleController.deleteSale);

module.exports = router;
