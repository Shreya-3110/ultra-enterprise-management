const express = require('express');
const router = express.Router();
const { getFees, createFee, deleteFee } = require('../controllers/feeController');
const { protect, authorize, checkPlan } = require('../middleware/auth');

router.use(protect);

router.get('/', getFees);

// Standard and Premium can create category based fees
router.post('/', authorize('ADMIN'), createFee);
router.delete('/:id', deleteFee);

module.exports = router;
