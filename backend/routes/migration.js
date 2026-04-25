const express = require('express');
const router = express.Router();
const { startSimulation, executeMigration } = require('../controllers/migrationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/simulate', startSimulation);
router.post('/commit', executeMigration);

module.exports = router;
