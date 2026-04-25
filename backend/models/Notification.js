const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  type: {
    type: String,
    enum: ['EMAIL', 'WHATSAPP', 'SMS', 'SYSTEM'],
    required: true
  },
  category: {
    type: String,
    enum: ['FEE_DUE', 'PAYMENT_CONFIRMATION', 'GENERAL', 'URGENT'],
    default: 'GENERAL'
  },
  recipient: {
    type: String, // Email address or Phone number
    required: true
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SENT', 'FAILED', 'PENDING'],
    default: 'SENT'
  },
  error: String,
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
