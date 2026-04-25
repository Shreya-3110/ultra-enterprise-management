const express = require('express');
const router = express.Router();
const { processRefund, adjustWallet, waiveFine } = require('../controllers/adjustmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/refund/:paymentId', processRefund);
router.post('/wallet/:studentId', adjustWallet);
router.post('/waive-fine/:feeId', waiveFine);

module.exports = router;
