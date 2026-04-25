const express = require('express');
const router = express.Router();
const { generateApiKey, getExternalLedger } = require('../controllers/integrationController');
const { handleStripeWebhook } = require('../controllers/webhookController');
const { protect, authorize } = require('../middleware/auth');
const { apiAuth } = require('../middleware/apiAuth');

// 1. Webhooks (Public, but secured by Stripe signature)
router.post('/webhooks/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);

// 2. API Key Management (Admin only)
router.post('/keys', protect, authorize('ADMIN'), generateApiKey);

// 3. External API (Secured by API Key)
router.get('/reports/ledger', apiAuth, getExternalLedger);

module.exports = router;
