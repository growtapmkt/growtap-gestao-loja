const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware.protect, productController.getAllProducts);
router.post('/', authMiddleware.protect, productController.createProduct);

// Variation routes (specific paths first)
router.post('/:productId/variations', authMiddleware.protect, productController.addVariation);
router.delete('/variations/:variationId', authMiddleware.protect, productController.deleteVariation);
router.put('/variations/:variationId', authMiddleware.protect, productController.updateVariation);

// Bulk routes
router.patch('/bulk-status', authMiddleware.protect, productController.bulkChangeStatus);
router.delete('/bulk', authMiddleware.protect, productController.bulkDeleteProducts);

// Product ID routes (generic parameter paths last)
router.put('/:productId', authMiddleware.protect, productController.updateProduct);
router.delete('/:productId', authMiddleware.protect, productController.deleteProduct);

module.exports = router;
