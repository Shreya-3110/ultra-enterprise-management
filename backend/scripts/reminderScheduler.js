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
    now.setHours(0,0,0,0);
    
    // Find all unfulfiled installments
    const fees = await StudentFee.find({ 
      'installments.status': { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] } 
    }).populate('studentId').populate('feeStructureId');

    console.log(`[Reminder Engine] Scanning ${fees.length} active ledgers...`);

    for (const feeRecord of fees) {
      if (!feeRecord.studentId || !feeRecord.feeStructureId) continue;

      for (const inst of feeRecord.installments) {
        if (inst.status === 'PAID') continue;

        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0,0,0,0);
        
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

        // Logic 3: Overdue (Day 1, and then every 3 days)
        if (diffInDays < 0) {
          const overdueDays = Math.abs(diffInDays);
          if (overdueDays === 1 || overdueDays % 3 === 0) {
            console.log(`[Reminder Engine] Sending Overdue Alert for ${feeRecord.studentId.firstName} (${overdueDays} days late)`);
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
      inst.amount,
      isOverdue
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
    cron.schedule('0 0 * * *', () => {
        runReminderEngine();
    });
    console.log('[Scheduler] Payment Reminder Cron initialized (Daily at 00:00).');
};

module.exports = { initReminderScheduler, runReminderEngine };
