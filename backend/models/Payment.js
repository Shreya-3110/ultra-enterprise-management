const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeStructureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure'
  },
  amountPaid: {
    type: Number,
    required: true
  },
  lateFeePaid: {
    type: Number,
    default: 0
  },
  datePaid: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['CASH', 'UPI', 'ONLINE', 'BANK_TRANSFER'],
    required: true
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'],
    default: 'COMPLETED'
  },
  notes: String,
  installments: {
    type: [{
      name: String,
      amountAllocated: Number,
      isFullyPaid: Boolean
    }],
    default: []
  },
  status: {
    type: String,
    enum: ['PAID', 'REFUNDED', 'PARTIAL', 'VOID'],
    default: 'PAID'
  },
  refundDetails: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
