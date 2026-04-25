const express = require('express');
const router = express.Router();
const { registerSchool, registerUser, login, upgradePlan, verifyTwoFactor } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerSchool);
router.post('/register-user', registerUser);
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactor);
router.post('/upgrade', protect, upgradePlan);

module.exports = router;
