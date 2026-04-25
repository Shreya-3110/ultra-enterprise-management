const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String, // e.g., Class 10 - Standard Plan
    required: true
  },
  description: String,
  category: {
    type: String, // BASIC, STANDARD, PREMIUM classes might have different fees
    default: 'GENERAL'
  },
  feeHeads: [
    {
      headName: { type: String, required: true }, // e.g. Tuition, Lab, Sports
      amount: { type: Number, required: true }
    }
  ],
  amount: {
    type: Number, // Total sum of feeHeads
    required: true
  },
  frequency: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'],
    default: 'MONTHLY'
  },
  applicableClasses: [String],
  lateFee: {
    type: Number,
    default: 0
  },
  lateFeeFrequency: {
    type: String,
    enum: ['FIXED', 'DAILY'],
    default: 'FIXED'
  },
  dueDate: Date,
  installments: [
    {
      label: String, // e.g. Term 1
      amount: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      status: { 
        type: String, 
        enum: ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL'], 
        default: 'PENDING' 
      }
    }
  ],
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
