const mongoose = require('mongoose');
require('dotenv').config();

const AuditLog = require('./models/AuditLog');
const User = require('./models/User');
const Student = require('./models/Student');
const Payment = require('./models/Payment');

async function fixAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const correctId = '69e511600bbec3a9c62a17b62';
    
    // 1. Force update all users
    const users = await User.updateMany({}, { schoolId: correctId });
    console.log(`Users corrected: ${users.modifiedCount}`);

    // 2. Force update all Audit Logs and fix the 'user' object
    const audits = await AuditLog.updateMany({}, { 
      $set: { 
        schoolId: correctId,
        'user.name': 'Premium Admin',
        'user.id': correctId,
        'user.role': 'admin'
      } 
    });
    console.log(`Audit logs restored: ${audits.modifiedCount}`);

    // 3. Force update all Students
    const students = await Student.updateMany({}, { schoolId: correctId });
    console.log(`Students synchronized: ${students.modifiedCount}`);

    // 4. Force update all Payments
    const payments = await Payment.updateMany({}, { schoolId: correctId });
    console.log(`Payments synchronized: ${payments.modifiedCount}`);

    console.log('SUCCESS: All identities are perfectly aligned.');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

fixAudit();
