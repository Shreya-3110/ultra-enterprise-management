const express = require('express');
const router = express.Router();
const { recordPayment, getPayments, refundPayment, generatePaymentQR } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('ADMIN', 'STAFF', 'PARENT'), recordPayment);
router.get('/', getPayments);
router.get('/qr/:studentId', authorize('ADMIN', 'STAFF', 'PARENT'), generatePaymentQR);
router.post('/:id/refund', authorize('ADMIN'), refundPayment);

module.exports = router;
