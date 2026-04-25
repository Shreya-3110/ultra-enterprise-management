const express = require('express');
const router = express.Router();
const { getGlobalRoyaltyReport, getFranchiseOwnerSplit } = require('../controllers/franchiseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/royalties', authorize('ADMIN'), getGlobalRoyaltyReport);
router.get('/my-split', authorize('ADMIN', 'STAFF'), getFranchiseOwnerSplit);

module.exports = router;
