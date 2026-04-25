const { runBackup, runRestore, listBackups } = require('../utils/backupEngine');
const { logAction, ACTIONS } = require('../utils/auditLogger');

// @desc    Trigger a manual system backup
// @route   POST /api/v1/recovery/backup
exports.triggerBackup = async (req, res) => {
    try {
        const result = await runBackup();
        await logAction(req.user._id, ACTIONS.UPDATE_STUDENT, `Manual System Snapshot: ${result.filename}`);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Trigger a system restoration
// @route   POST /api/v1/recovery/restore
exports.triggerRestore = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ success: false, message: 'Backup filename is required' });

        await runRestore(filename);
        await logAction(req.user._id, ACTIONS.UPDATE_STUDENT, `CRITICAL: System restored from ${filename}`);

        res.status(200).json({
            success: true,
            message: 'System recovery complete. Database has been rebuilt.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    List all available recovery points
// @route   GET /api/v1/recovery/list
exports.getBackupList = async (req, res) => {
    try {
        const backups = listBackups();
        res.status(200).json({
            success: true,
            data: backups
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
