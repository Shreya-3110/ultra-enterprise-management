const express = require('express');
const { getNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getNotifications);

module.exports = router;
