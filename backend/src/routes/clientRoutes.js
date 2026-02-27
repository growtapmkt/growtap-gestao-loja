const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware.protect, clientController.getClients);
router.get('/:id/stats', authMiddleware.protect, clientController.getClientStats);
router.get('/:id', authMiddleware.protect, clientController.getClientById);
router.post('/', authMiddleware.protect, clientController.createClient);
router.put('/:id', authMiddleware.protect, clientController.updateClient);
router.delete('/:id', authMiddleware.protect, clientController.deleteClient);

module.exports = router;
