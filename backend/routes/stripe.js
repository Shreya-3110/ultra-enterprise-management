const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.post('/create-intent', createPaymentIntent);

module.exports = router;
