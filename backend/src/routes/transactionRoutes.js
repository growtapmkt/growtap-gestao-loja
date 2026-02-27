const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, transactionController.getTransactions);
router.post('/', protect, transactionController.createTransaction);
router.get('/summary', protect, transactionController.getSummary);
router.delete('/:id', protect, transactionController.deleteTransaction);

module.exports = router;
