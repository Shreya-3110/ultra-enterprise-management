const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  isHeadOffice: {
    type: Boolean,
    default: false
  },
  parentSchoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['BASIC', 'STANDARD', 'PREMIUM'],
    default: 'BASIC'
  },
  franchiseSettings: {
    isFranchise: { type: Boolean, default: false },
    royaltyPercentage: { type: Number, default: 10 }, // % that goes to Head Office
    agreementSignedDate: Date,
    franchiseModel: { type: String, enum: ['FOFO', 'FOCO', 'COCO'], default: 'FOFO' }
  },
  address: {
    street: String,
    city: String,
    state: String
  },
  apiKeys: [{
    key: String,
    name: String,
    createdAt: { type: Date, default: Date.now },
    lastUsed: Date
  }],
  settings: {
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    upiId: { type: String, trim: true },
    merchantName: { type: String, trim: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('School', schoolSchema);
