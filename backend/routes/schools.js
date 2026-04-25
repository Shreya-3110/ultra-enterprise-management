const express = require('express');
const router = express.Router();
const { getBranches, createBranch, getHeadOfficeStats } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.get('/head-office/stats', getHeadOfficeStats);

module.exports = router;
