const cron = require('node-cron');
const StudentFee = require('../models/StudentFee');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const { sendEmailReminder, sendWhatsAppReminder } = require('../utils/notificationService');

/**
 * Main Logic to scan and send reminders
 */
const runReminderEngine = async () => {
  try {
    console.log('[Reminder Engine] Starting Daily Scan...');
    const now = new Date();
    
    // Calculate targets
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find all unfulfiled installments
    // Using simple approach: finding all pending student fees
    const fees = await StudentFee.find({ 
      'installments.status': { $in: ['PENDING', 'OVERDUE'] } 
    }).populate('studentId').populate('feeStructureId');

    console.log(`[Reminder Engine] Scanning ${fees.length} active ledgers...`);

    for (const feeRecord of fees) {
      if (!feeRecord.studentId || !feeRecord.feeStructureId) continue;

      for (const inst of feeRecord.installments) {
        if (inst.status === 'PAID') continue;

        const dueDate = new Date(inst.dueDate);
        const diffInDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        // Logic 1: Exactly 3 Days before due date
        if (diffInDays === 3) {
          console.log(`[Reminder Engine] Sending 3-day warning for ${feeRecord.studentId.firstName}`);
          await triggerAlerts(feeRecord, inst);
        }

        // Logic 2: Due Today
        if (diffInDays === 0) {
          console.log(`[Reminder Engine] Sending Due Date Alert for ${feeRecord.studentId.firstName}`);
          await triggerAlerts(feeRecord, inst);
        }

        // Logic 3: Overdue
        if (inst.status === 'OVERDUE' || diffInDays < 0) {
          // Send reminder every few days if overdue (e.g., if divisible by 3)
          if (Math.abs(diffInDays) % 3 === 0) {
            console.log(`[Reminder Engine] Sending Overdue Alert for ${feeRecord.studentId.firstName}`);
            await triggerAlerts(feeRecord, inst, true);
          }
        }
      }
    }
    console.log('[Reminder Engine] Daily Scan Complete.');
  } catch (error) {
    console.error('[Reminder Engine Error]', error);
  }
};

const triggerAlerts = async (feeRecord, inst, isOverdue = false) => {
  const student = feeRecord.studentId;
  const parentEmail = student.parentDetails?.email;
  const parentPhone = student.parentDetails?.phone;
  const schoolId = feeRecord.schoolId;

  // 1. Email
  if (parentEmail) {
    await sendEmailReminder(
      schoolId,
      student._id,
      parentEmail, 
      student.firstName, 
      feeRecord.feeStructureId.name, 
      inst.dueDate, 
      inst.amount
    );
  }

  // 2. WhatsApp
  if (parentPhone) {
    await sendWhatsAppReminder(
      schoolId,
      student._id,
      parentPhone, 
      student.firstName, 
      inst.amount, 
      inst.dueDate, 
      isOverdue
    );
  }
};

/**
 * Initialize Cron Job (Every midnight at 12:00 AM)
 */
const initReminderScheduler = () => {
    // Schedule for 00:00 every night: '0 0 * * *'
    // For testing/demo, we can run it every hour: '0 * * * *'
    cron.schedule('0 0 * * *', () => {
        runReminderEngine();
    });

    console.log('[Scheduler] Payment Reminder Cron initialized (Daily at 00:00).');
};

module.exports = { initReminderScheduler, runReminderEngine };
