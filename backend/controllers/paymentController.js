const Payment = require('../models/Payment');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const School = require('../models/School');
const { logAction, ACTIONS } = require('../utils/auditLogger');
const { generateUPIQR } = require('../utils/qrGenerator');

// @desc    Record a payment
// @route   POST /api/v1/payments
exports.recordPayment = async (req, res) => {
  try {
    req.body.schoolId = req.user.schoolId;
    
    if (!req.body.studentId) {
      return res.status(400).json({ success: false, message: 'Please provide a student ID' });
    }

    // Verify student belongs to school
    const student = await Student.findOne({ 
      _id: req.body.studentId, 
      schoolId: req.user.schoolId 
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this school' });
    }

    // 1. ADVANCED BILLING LOGIC (Using Individual Ledger)
    const { allocatePayment } = require('../utils/billingUtils');
    let amountToAllocate = Number(req.body.amountPaid) + (student.walletBalance || 0);
    let totalLateFeesCollected = 0;
    
    let allocation = { allocations: [] };
    
    if (req.body.feeStructureId) {
      // Find or Initialize the individual StudentFee record
      let studentFee = await StudentFee.findOne({ 
        studentId: req.body.studentId, 
        feeStructureId: req.body.feeStructureId 
      });

      const feeTemplate = await FeeStructure.findById(req.body.feeStructureId);
      if (!feeTemplate) {
        return res.status(404).json({ success: false, message: 'Fee structure template not found' });
      }

      // If no ledger exists yet, initialize it from the template
      if (!studentFee) {
        studentFee = await StudentFee.create({
          schoolId: req.user.schoolId,
          studentId: req.body.studentId,
          feeStructureId: req.body.feeStructureId,
          installments: feeTemplate.installments.map(inst => ({
            amount: inst.amount,
            paidAmount: 0,
            dueDate: inst.dueDate,
            status: 'PENDING'
          }))
        });
      }
      
      if (studentFee && studentFee.installments && studentFee.installments.length > 0) {
        // Use our utility to allocate funds
        allocation = allocatePayment(
          studentFee.installments, 
          amountToAllocate, 
          feeTemplate.lateFee || 0
        );

        studentFee.installments = allocation.updatedInstallments;
        amountToAllocate = allocation.remainingAmount;
        totalLateFeesCollected = allocation.totalLateFees;
        req.body.installments = allocation.allocations;
        
        console.log(`Allocation generated. Count: ${allocation.allocations?.length || 0}`);
        if (allocation.allocations?.length > 0) {
          console.log('Allocations snapshot:', JSON.stringify(allocation.allocations));
        }

        // Update total paid (amount invested into this fee structure specifically)
        const paymentContribution = (Number(req.body.amountPaid) + (student.walletBalance || 0)) - amountToAllocate;
        studentFee.totalPaid = (studentFee.totalPaid || 0) + paymentContribution;
        
        await studentFee.save();
      }
    }

    // 2. Update Student Wallet
    student.walletBalance = amountToAllocate;
    await student.save();

    // 3. Create Payment with installment snapshot
    const paymentData = {
      ...req.body,
      schoolId: req.user.schoolId,
      lateFeePaid: totalLateFeesCollected,
      installments: allocation.allocations || []
    };

    let payment = await Payment.create(paymentData);

    // Re-fetch with full details to ensure all generated data is returned
    payment = await Payment.findById(payment._id)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('feeStructureId', 'name');

    console.log(`Final Payment Saved. Installments captured: ${payment.installments?.length || 0}`);

    // Trigger Notification (Requirement 6)
    if (student.parentDetails?.email) {
      const { sendPaymentConfirmation } = require('../utils/notificationService');
      sendPaymentConfirmation(
        req.user.schoolId,
        student._id,
        student.parentDetails.email,
        `${student.firstName} ${student.lastName}`,
        req.body.amountPaid,
        payment.transactionId || payment._id
      );
    }

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.PAYMENT_RECORDED,
      resource: 'Payment',
      details: `Recorded payment of ₹${payment.amountPaid} for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`
    });

    res.status(201).json({ success: true, data: payment, walletBalance: student.walletBalance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/v1/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ schoolId: req.user.schoolId })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('feeStructureId', 'name');
    
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Process Refund/Reversal
// @route   POST /api/v1/payments/:id/refund
exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'REFUNDED') return res.status(400).json({ success: false, message: 'Payment already refunded' });

    // Reverse the ledger directly in StudentFee
    if (payment.feeStructureId) {
      const studentFee = await StudentFee.findOne({ studentId: payment.studentId, feeStructureId: payment.feeStructureId });
      if (studentFee) {
        studentFee.totalPaid = Math.max(0, (studentFee.totalPaid || 0) - payment.amountPaid);
        
        // Very simplistic reversion of standard installments for demo purposes
        studentFee.installments.forEach(inst => {
           if (inst.status === 'PAID') inst.status = 'PENDING';
        });
        await studentFee.save();
      }
    }

    payment.status = 'REFUNDED';
    await payment.save();

    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: 'PAYMENT_REFUNDED',
      resource: 'Payment',
      details: `Refunded payment of ₹${payment.amountPaid} (Transaction: ${payment._id})`
    });

    res.status(200).json({ success: true, message: 'Payment successfully refunded and ledger adjusted.', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a dynamic UPI QR Code for a student
// @route   GET /api/v1/payments/qr/:studentId
exports.generatePaymentQR = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId, schoolId: req.user.schoolId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const school = await School.findById(req.user.schoolId);
    if (!school || !school.settings?.upiId) {
      return res.status(400).json({ 
        success: false, 
        message: 'School UPI ID not configured. Please add your UPI ID in School Settings.' 
      });
    }

    // Default amount to everything owed if not specified
    let amount = Number(req.query.amount);
    if (!amount || isNaN(amount)) {
       // Logic to calculate total pending across all ledgers
       const ledgers = await StudentFee.find({ studentId: student._id });
       amount = ledgers.reduce((total, led) => {
          return total + led.installments.reduce((instTotal, inst) => {
             return instTotal + (inst.status !== 'PAID' ? (inst.amount - (inst.paidAmount || 0)) : 0);
          }, 0);
       }, 0);
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'No outstanding balance found for this student.' });
    }

    const qr = await generateUPIQR(
      school.settings.upiId,
      school.settings.merchantName || school.name,
      amount,
      `Fees_${student.admissionNumber}`
    );

    res.status(200).json({
      success: true,
      data: {
        amount,
        qrImage: qr.qrDataURI,
        upiString: qr.upiString,
        merchant: school.settings.merchantName || school.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

