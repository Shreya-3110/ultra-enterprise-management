const Payment = require('../models/Payment');
const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee');
const { logAction, ACTIONS } = require('../utils/auditLogger');

// @desc    Process a refund (marks payment as refunded and adds to wallet)
// @route   POST /api/v1/adjustments/refund/:paymentId
exports.processRefund = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        if (payment.status === 'REFUNDED') {
            return res.status(400).json({ success: false, message: 'Payment is already refunded' });
        }

        const { reason, toWallet } = req.body;

        payment.status = 'REFUNDED';
        payment.refundDetails = {
            amount: payment.amountPaid,
            reason: reason || 'Administrative Refund',
            refundedAt: Date.now(),
            processedBy: req.user._id
        };

        await payment.save();

        if (toWallet) {
            const student = await Student.findById(payment.studentId);
            student.walletBalance += payment.amountPaid;
            await student.save();
        }

        await logAction(req.user._id, ACTIONS.UPDATE_PAYMENT, `Processed Refund for Payment ${payment._id}. Reason: ${reason}`);

        res.status(200).json({ success: true, message: 'Refund processed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Manually adjust Student Wallet
// @route   POST /api/v1/adjustments/wallet/:studentId
exports.adjustWallet = async (req, res) => {
    try {
        const { amount, action, reason } = req.body; // action: 'ADD' or 'SUBTRACT'
        const student = await Student.findById(req.params.studentId);
        
        if (action === 'ADD') {
            student.walletBalance += Number(amount);
        } else {
            student.walletBalance -= Number(amount);
        }

        await student.save();
        await logAction(req.user._id, ACTIONS.UPDATE_STUDENT, `Manual Wallet Adjustment for ${student.firstName}: ${action} ${amount}. Reason: ${reason}`);

        res.status(200).json({ success: true, walletBalance: student.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Waive specific fine from a StudentFee
// @route   POST /api/v1/adjustments/waive-fine/:feeId
exports.waiveFine = async (req, res) => {
    try {
        const { amount } = req.body;
        const fee = await StudentFee.findById(req.params.feeId);
        
        // Logic to subtract from current late fine
        // Assuming fee object has a way to track late fees
        // This is a simplified waiver logic
        fee.discount += Number(amount); 
        await fee.save();

        await logAction(req.user._id, ACTIONS.UPDATE_FEE, `Waived fine of ${amount} for Fee ID: ${fee._id}`);

        res.status(200).json({ success: true, message: 'Fine waived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
