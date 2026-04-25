const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee');
const FeeStructure = require('../models/FeeStructure');
const MessageTemplate = require('../models/MessageTemplate');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { runReminderEngine } = require('../scripts/reminderScheduler');

const testAutomation = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const admin = await User.findOne({ role: 'ADMIN' });
    const schoolId = admin.schoolId;

    // 1. Create a Custom Template for this school
    console.log('\nStep 1: Creating custom DUE_REMINDER template...');
    await MessageTemplate.deleteMany({ schoolId, category: 'DUE_REMINDER', type: 'EMAIL' });
    const template = await MessageTemplate.create({
      schoolId,
      category: 'DUE_REMINDER',
      type: 'EMAIL',
      subject: 'CUSTOM ALERT: {{STUDENT_NAME}} - {{FEE_NAME}}',
      body: 'Hello! This is a custom automation test for {{STUDENT_NAME}}. You owe {{AMOUNT}} due on {{DUE_DATE}}.'
    });
    console.log('✅ Template Created:', template.subject);

    // 2. Create a student with a fee due in EXACTLY 3 days
    console.log('\nStep 2: Creating student with 3-day target due date...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const fee = await FeeStructure.create({
      schoolId,
      name: 'Automation Target Plan',
      amount: 5000,
      installments: [{ label: 'Term 1', amount: 5000, dueDate }]
    });

    const student = await Student.create({
      schoolId,
      admissionNumber: 'AUTO-' + Date.now(),
      firstName: 'AutomationRobot',
      lastName: 'V1',
      currentClass: 'Class 10',
      parentDetails: { email: 'test-parent@ultra.com' }
    });

    await StudentFee.create({
      schoolId,
      studentId: student._id,
      feeStructureId: fee._id,
      installments: [{
        amount: 5000,
        paidAmount: 0,
        dueDate,
        status: 'PENDING'
      }]
    });
    console.log('✅ Student and Ledger set up for due date:', dueDate.toDateString());

    // 3. Force Trigger Reminder Engine
    console.log('\nStep 3: Force-triggering Reminder Engine...');
    await runReminderEngine();

    // 4. Verify Notification
    console.log('\nStep 4: Verifying results in Notification Hub...');
    const latestNotif = await Notification.findOne({ studentId: student._id }).sort({ createdAt: -1 });

    if (latestNotif && latestNotif.subject.includes('AutomationRobot')) {
      console.log('✅ SUCCESS: Custom Template Applied!');
      console.log('Message Content:', latestNotif.message);
    } else {
      console.error('❌ FAILED: Notification not found or template not applied.');
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await Student.deleteOne({ _id: student._id });
    await FeeStructure.deleteOne({ _id: fee._id });
    await StudentFee.deleteOne({ studentId: student._id });
    // Keep template for user to see in UI
    
    await mongoose.connection.close();
    console.log('Done.');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

testAutomation();
