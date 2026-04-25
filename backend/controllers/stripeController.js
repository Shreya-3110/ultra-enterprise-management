const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const FeeStructure = require('../models/FeeStructure');
const Student = require('../models/Student');

// @desc    Create Payment Intent
// @route   POST /api/v1/stripe/create-intent
// @access  Private (Parent/Staff)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, studentId } = req.body;

    if (!amount || !studentId) {
       return res.status(400).json({ success: false, message: 'Amount and Student ID are required' });
    }

    // Verify student ownership if user is PARENT
    if (req.user.role === 'PARENT') {
      const student = await Student.findOne({ _id: studentId, schoolId: req.user.schoolId, 'parentDetails.email': req.user.email });
      if (!student) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this student' });
      }
    }

    // Amount must be in the smallest currency unit (paise for INR, cents for USD)
    // To keep it simple, we assume the frontend sends amount in whole currency unit (INR)
    const amountInSmallestUnit = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'inr',
      metadata: {
        studentId: studentId.toString(),
        schoolId: req.user.schoolId.toString(),
        userId: req.user._id.toString()
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Intent Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment intent creation failed'
    });
  }
};
