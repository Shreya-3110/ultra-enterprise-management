const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
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
    ref: 'FeeStructure',
    required: true
  },
  installments: [
    {
      amount: { type: Number, required: true },
      paidAmount: { type: Number, default: 0 },
      dueDate: { type: Date, required: true },
      status: { 
        type: String, 
        enum: ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL'], 
        default: 'PENDING' 
      }
    }
  ],
  totalPaid: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookup of a student's specific fee record
studentFeeSchema.index({ studentId: 1, feeStructureId: 1 });

module.exports = mongoose.model('StudentFee', studentFeeSchema);
