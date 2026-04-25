const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

// All audit routes are protected and admin-only
router.get('/:schoolId', protect, getAuditLogs);
router.get('/', protect, getAuditLogs);

module.exports = router;
