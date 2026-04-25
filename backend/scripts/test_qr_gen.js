const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const School = require('../models/School');
const Student = require('../models/Student');
const User = require('../models/User');
const { generateUPIQR } = require('../utils/qrGenerator');

const testQRGen = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) throw new Error('Admin not found');
    
    const schoolId = admin.schoolId;

    // 1. Update School with a Fake UPI ID for testing
    console.log('\nStep 1: Configuring School UPI settings...');
    await School.findByIdAndUpdate(schoolId, {
      'settings.upiId': 'school-test@axisbank',
      'settings.merchantName': 'Ultra Enterprise High'
    });
    console.log('✅ School UPI configured.');

    // 2. Generate a Test QR
    console.log('\nStep 2: Generating Test QR for ₹1,500...');
    const result = await generateUPIQR(
      'school-test@axisbank',
      'Ultra Enterprise High',
      1500,
      'Test_Payment_123'
    );

    // 3. Verify
    console.log('\n--- VERIFICATION REPORT ---');
    console.log('UPI Link:', result.upiString);
    
    if (result.upiString.includes('am=1500.00')) {
      console.log('✅ Amount Correct (₹1500.00)');
    } else {
      console.error('❌ Amount Incorrect');
    }

    if (result.upiString.includes('pa=school-test@axisbank')) {
      console.log('✅ UPI VPA Correct');
    } else {
      console.error('❌ UPI VPA Incorrect');
    }

    if (result.qrDataURI.startsWith('data:image/png;base64,')) {
      console.log('✅ Base64 Image Generated');
    } else {
      console.error('❌ Image Generation Failed');
    }

    await mongoose.connection.close();
    console.log('\nTest Complete.');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

testQRGen();
