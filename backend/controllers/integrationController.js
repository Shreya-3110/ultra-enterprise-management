const School = require('../models/School');
const Payment = require('../models/Payment');
const crypto = require('crypto');

// @desc    Generate a new API Key for the school
// @route   POST /api/v1/integration/keys
exports.generateApiKey = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { name } = req.body;
        
        const newKey = `ue_${crypto.randomBytes(24).toString('hex')}`;
        
        await School.findByIdAndUpdate(schoolId, {
            $push: { apiKeys: { key: newKey, name: name || 'Third Party App' } }
        });

        res.status(201).json({
            success: true,
            key: newKey,
            message: 'API Key generated. Copy it now, it will not be shown again in full.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    External API to pull financial ledger
// @route   GET /api/v1/integration/reports/ledger
exports.getExternalLedger = async (req, res) => {
    try {
        // This route is specifically designed to be called by 3rd party tools
        // Auth is handled by the apiAuth middleware
        const schoolId = req.school._id; 
        
        const payments = await Payment.find({ schoolId })
            .select('amountPaid studentId paymentMethod createdAt status')
            .populate('studentId', 'firstName lastName admissionNumber')
            .sort('-createdAt')
            .limit(100);

        res.status(200).json({
            success: true,
            organization: req.school.name,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
