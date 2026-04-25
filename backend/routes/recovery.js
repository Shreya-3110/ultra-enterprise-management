const express = require('express');
const router = express.Router();
const { triggerBackup, triggerRestore, getBackupList } = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Disaster Recovery is restricted to Head Office Admin
router.use((req, res, next) => {
    if (!req.user.isHeadOffice) {
        return res.status(403).json({ success: false, message: 'Only Head Office can manage disaster recovery.' });
    }
    next();
});

router.post('/backup', triggerBackup);
router.post('/restore', triggerRestore);
router.get('/list', getBackupList);

module.exports = router;
