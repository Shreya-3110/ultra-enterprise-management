const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative action
 * @param {Object} data - Audit log data
 * @param {string} data.schoolId - School ID
 * @param {Object} data.user - User object {id, name, role}
 * @param {string} data.action - Action constant
 * @param {string} data.resource - Resource name (e.g., 'Student')
 * @param {string} [data.resourceId] - ID of the affected resource
 * @param {string} [data.details] - Description
 * @param {Object} [data.changes] - {oldValue, newValue}
 */
const logAction = async (data) => {
  try {
    const log = new AuditLog({
      schoolId: data.schoolId,
      user: {
        id: data.user?.id || data.user?._id || 'unidentified',
        name: data.user?.name || 'System User',
        role: data.user?.role || 'admin'
      },
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      changes: data.changes
    });
    
    await log.save();
    console.log(`[Audit] Action logged: ${data.action} on ${data.resource}`);
  } catch (error) {
    console.error('Audit Log Error:', error.message);
    console.error('Failed Log Data:', JSON.stringify(data, null, 2));
  }
};

module.exports = {
  logAction,
  ACTIONS: {
    PAYMENT_RECORDED: 'PAYMENT_RECORDED',
    STUDENT_CREATED: 'STUDENT_CREATED',
    STUDENT_UPDATED: 'STUDENT_UPDATED',
    STUDENT_DELETED: 'STUDENT_DELETED',
    STUDENT_BULK_IMPORT: 'STUDENT_BULK_IMPORT',
    FEE_STRUCTURE_CREATED: 'FEE_STRUCTURE_CREATED',
    FEE_STRUCTURE_UPDATED: 'FEE_STRUCTURE_UPDATED',
    FEE_STRUCTURE_DELETED: 'FEE_STRUCTURE_DELETED',
    REMINDER_SENT: 'REMINDER_SENT'
  }
};
