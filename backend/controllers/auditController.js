const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @desc    Get all audit logs for a school
// @route   GET /api/v1/audit
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    // Safety check for req.user (populated by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    const schoolId = req.user.schoolId;
    console.log('[Audit API DEBUG] req.user.email:', req.user.email);
    console.log('[Audit API DEBUG] schoolId:', schoolId);
    
    // Safely construct the query
    let query = {};
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      query.schoolId = new mongoose.Types.ObjectId(schoolId);
    } else {
      console.warn('[Audit API Warning] Invalid School ID format:', schoolId);
      // If the ID is invalid, we might want to return nothing or all (for debugging)
      // For now, let's return nothing if the ID is invalid to maintain security
      return res.status(200).json({ success: true, count: 0, data: [], message: 'Invalid School ID' });
    }
    
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('[Audit API Error]:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs [DEBUG_V1]: ' + error.message
    });
  }
};
