const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  category: {
    type: String,
    enum: ['DUE_REMINDER', 'OVERDUE_ALERT', 'PAYMENT_CONFIRMATION'],
    required: true
  },
  type: {
    type: String,
    enum: ['EMAIL', 'WHATSAPP'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Template body is required']
  },
  placeholders: [String], // e.g. ["STUDENT_NAME", "AMOUNT", "DUE_DATE"]
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure unique template per school, category, and type
messageTemplateSchema.index({ schoolId: 1, category: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
