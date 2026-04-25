const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const Student = require('../backend/models/Student');
const FeeStructure = require('../backend/models/FeeStructure');
const StudentFee = require('../backend/models/StudentFee');
const User = require('../backend/models/User');
const { autoLinkStudentToFee } = require('../backend/utils/feeAutoLinker');

const testAutoLink = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const admin = await User.findOne({ role: 'ADMIN' });
    const schoolId = admin.schoolId;

    // 1. Create a "Class 12" Fee Structure
    console.log('\nStep 1: Creating "Class 12 - Science" Fee Structure...');
    const fee = await FeeStructure.create({
      schoolId: schoolId,
      name: 'Class 12 - Science Plan',
      category: 'GENERAL',
      applicableClasses: ['Class 12'],
      amount: 10000,
      installments: [
        { label: 'Term 1', amount: 5000, dueDate: new Date() },
        { label: 'Term 2', amount: 5000, dueDate: new Date() }
      ]
    });
    console.log('✅ Created Fee:', fee.name);

    // 2. Create a "Class 12" Student
    console.log('\nStep 2: Creating "John Doe" in Class 12...');
    const student = await Student.create({
      schoolId: schoolId,
      admissionNumber: 'TEST-' + Date.now(),
      firstName: 'John',
      lastName: 'Doe',
      currentClass: 'Class 12',
      category: 'GENERAL'
    });
    console.log('✅ Created Student:', student.firstName);

    // 3. Trigger Auto Link
    console.log('\nStep 3: Triggering Auto-Linker...');
    await autoLinkStudentToFee(student._id, schoolId);

    // 4. Verify
    console.log('\nStep 4: Verifying Results...');
    const updatedStudent = await Student.findById(student._id);
    const ledger = await StudentFee.findOne({ studentId: student._id });

    if (updatedStudent.activeFeeStructure?.toString() === fee._id.toString()) {
      console.log('✅ SUCCESS: Student linked to correct Fee Structure.');
    } else {
      console.error('❌ FAILED: Student not linked.');
    }

    if (ledger) {
      console.log(`✅ SUCCESS: StudentFee Ledger created with ${ledger.installments.length} installments.`);
    } else {
      console.error('❌ FAILED: Ledger not created.');
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await Student.deleteOne({ _id: student._id });
    await FeeStructure.deleteOne({ _id: fee._id });
    await StudentFee.deleteOne({ studentId: student._id });
    
    await mongoose.connection.close();
    console.log('Done.');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

testAutoLink();
