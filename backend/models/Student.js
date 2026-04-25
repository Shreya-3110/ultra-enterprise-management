const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  currentClass: {
    type: String,
    required: true
  },
  section: String,
  parentDetails: {
    name: String,
    email: String,
    phone: String,
    occupation: String
  },
  address: String,
  status: {
    type: String,
    enum: ['INQUIRY', 'ACTIVE', 'INACTIVE', 'ALUMNI'],
    default: 'INQUIRY'
  },
  category: {
    type: String, // e.g. GENERAL, SCHOLARSHIP, STAFF_CHILD
    default: 'GENERAL'
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  activeFeeStructures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for multi-tenant isolation and searching
studentSchema.index({ schoolId: 1, admissionNumber: 1 });

module.exports = mongoose.model('Student', studentSchema);
