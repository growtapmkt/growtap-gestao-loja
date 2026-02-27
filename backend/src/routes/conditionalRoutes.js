const express = require('express');
const router = express.Router();
const conditionalController = require('../controllers/conditionalController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.post('/', conditionalController.createConditional);
router.get('/', conditionalController.getConditionals);
router.post('/:id/finalize', conditionalController.finalizeConditional);
router.post('/:id/return', conditionalController.returnConditional);
router.put('/:id', conditionalController.updateConditional);
router.delete('/:id', conditionalController.deleteConditional);

module.exports = router;
