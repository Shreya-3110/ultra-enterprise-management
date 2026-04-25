const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const User = require('../models/User');
const { autoLinkStudentToFee } = require('../utils/feeAutoLinker');

const testMultiLink = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const admin = await User.findOne({ role: 'ADMIN' });
    const schoolId = admin.schoolId;

    const className = 'MULTI-CLASS-' + Date.now();

    // 1. Create TWO Fee Structures for the same class
    console.log(`\nStep 1: Creating TWO Fee Plans for ${className}...`);
    const fee1 = await FeeStructure.create({
      schoolId: schoolId,
      name: 'Plan Alpha - ' + Date.now(),
      applicableClasses: [className],
      amount: 1000,
      installments: [{ label: 'I1', amount: 1000, dueDate: new Date() }]
    });
    const fee2 = await FeeStructure.create({
      schoolId: schoolId,
      name: 'Plan Beta - ' + Date.now(),
      applicableClasses: [className],
      amount: 2000,
      installments: [{ label: 'I1', amount: 2000, dueDate: new Date() }]
    });
    console.log('✅ Created Alpha and Beta plans.');

    // 2. Create a Student in that class
    console.log(`\nStep 2: Creating "Jane Doe" in ${className}...`);
    const student = await Student.create({
      schoolId: schoolId,
      admissionNumber: 'MULTI-' + Date.now(),
      firstName: 'Jane',
      lastName: 'Doe',
      currentClass: className
    });
    console.log('✅ Created Student:', student.firstName);

    // 3. Trigger Auto Link
    console.log('\nStep 3: Triggering Auto-Linker...');
    await autoLinkStudentToFee(student._id, schoolId);

    // 4. Verify
    console.log('\nStep 4: Verifying Multi-Link Results...');
    const updated = await Student.findById(student._id);
    const ledgers = await StudentFee.find({ studentId: student._id });

    if (updated.activeFeeStructures.length === 2) {
      console.log('✅ SUCCESS: Student linked to BOTH Fee Structures.');
    } else {
      console.error(`❌ FAILED: Found ${updated.activeFeeStructures.length} links, expected 2.`);
    }

    if (ledgers.length === 2) {
      console.log('✅ SUCCESS: Two separate Ledger records created.');
    } else {
      console.error(`❌ FAILED: Found ${ledgers.length} ledgers, expected 2.`);
    }

    // Cleanup
    console.log('\nCleaning up...');
    await Student.deleteOne({ _id: student._id });
    await FeeStructure.deleteMany({ _id: { $in: [fee1._id, fee2._id] } });
    await StudentFee.deleteMany({ studentId: student._id });
    
    await mongoose.connection.close();
    console.log('Done.');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

testMultiLink();
