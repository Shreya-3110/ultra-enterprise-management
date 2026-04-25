const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  user: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String }
  },
  action: {
    type: String,
    required: true,
    enum: [
      'PAYMENT_RECORDED',
      'STUDENT_CREATED',
      'STUDENT_UPDATED',
      'STUDENT_DELETED',
      'STUDENT_BULK_IMPORT',
      'FEE_STRUCTURE_CREATED',
      'FEE_STRUCTURE_UPDATED',
      'FEE_STRUCTURE_DELETED',
      'REMINDER_SENT'
    ]
  },
  resource: {
    type: String, // 'Student', 'Payment', etc.
    required: true
  },
  resourceId: {
    type: String
  },
  details: {
    type: String // Human readable description
  },
  changes: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
