const express = require('express');
const router = express.Router();
const { getStats, getFinancialReports, getCollectionLedger, getAiPredictions } = require('../controllers/dashboardController');
const { protect, authorize, checkPlan } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('ADMIN', 'STAFF'), getStats);
router.get('/reports', authorize('ADMIN'), checkPlan('PREMIUM'), getFinancialReports);
router.get('/ledger', authorize('ADMIN'), checkPlan('PREMIUM'), getCollectionLedger);
router.get('/ai-predictions', authorize('ADMIN', 'STAFF'), checkPlan('STANDARD'), getAiPredictions);

module.exports = router;
