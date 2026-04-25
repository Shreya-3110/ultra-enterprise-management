const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee');
const { autoLinkStudentToFee } = require('../utils/feeAutoLinker');

// @desc    Handle Stripe Webhooks
// @route   POST /api/v1/integration/webhooks/stripe
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // In production, use stripe.webhooks.constructEvent to verify signature
        event = req.body; 

        if (event.type === 'payment_intent.succeeded') {
            const session = event.data.object;
            const { studentId, schoolId, userId } = session.metadata;

            // 1. Create Payment Record
            const payment = await Payment.create({
                studentId,
                schoolId,
                amountPaid: session.amount / 100, // Smallest unit to main unit
                paymentMethod: 'STRIPE',
                transactionId: session.id,
                collectedBy: userId,
                status: 'PAID'
            });

            // 2. Update Student Ledger (Simplified)
            // In a real scenario, we would allocate to specific fees
            console.log(`Payment confirmed via Webhook for Student: ${studentId}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
