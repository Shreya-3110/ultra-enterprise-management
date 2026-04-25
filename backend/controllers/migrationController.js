const { simulateMigration, commitMigration } = require('../utils/migrationEngine');
const { logAction, ACTIONS } = require('../utils/auditLogger');

// @desc    Perform a dry-run migration check (Sandbox)
// @route   POST /api/v1/migration/simulate
exports.startSimulation = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        const report = await simulateMigration(req.user.schoolId, data);
        
        res.status(200).json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Execute the final migration after user approval
// @route   POST /api/v1/migration/commit
exports.executeMigration = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || data.length === 0) {
            return res.status(400).json({ success: false, message: 'No data to import' });
        }

        const result = await commitMigration(data);
        
        await logAction(req.user._id, ACTIONS.UPDATE_STUDENT, `Executed Bulk Migration: ${result.length} students imported.`);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${result.length} students.`,
            count: result.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
