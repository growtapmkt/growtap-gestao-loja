const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware.protect, (req, res) => {
  res.json({ user: req.user });
});

const userController = require('../controllers/userController');

// Somente ADMIN ou OWNER (verificação redundante, mas segura)
router.post('/', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('ADMIN', 'OWNER'), 
  userController.createUser
);

module.exports = router;
