const School = require('../models/School');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// @desc    Get royalty report for Head Office
// @route   GET /api/v1/franchise/royalties
exports.getGlobalRoyaltyReport = async (req, res) => {
    try {
        const headOfficeId = req.user.schoolId;
        const branches = await School.find({ parentSchoolId: headOfficeId });
        
        const report = await Promise.all(branches.map(async (branch) => {
            const payments = await Payment.aggregate([
                { $match: { schoolId: branch._id } },
                { $group: { _id: null, total: { $sum: "$amountPaid" } } }
            ]);

            const gross = payments[0]?.total || 0;
            const royaltyPct = branch.franchiseSettings?.royaltyPercentage || 0;
            const royaltyOwed = (gross * royaltyPct) / 100;

            return {
                branchId: branch._id,
                branchName: branch.name,
                grossCollections: gross,
                royaltyPercentage: royaltyPct,
                royaltyAmount: royaltyOwed,
                netToBranch: gross - royaltyOwed
            };
        }));

        const totals = report.reduce((acc, curr) => {
            acc.totalGross += curr.grossCollections;
            acc.totalRoyalties += curr.royaltyAmount;
            return acc;
        }, { totalGross: 0, totalRoyalties: 0 });

        res.status(200).json({
            success: true,
            summary: totals,
            details: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get revenue split for a single Franchise Owner
// @route   GET /api/v1/franchise/my-split
exports.getFranchiseOwnerSplit = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const school = await School.findById(schoolId);
        
        const payments = await Payment.aggregate([
            { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
            { $group: { _id: null, total: { $sum: "$amountPaid" } } }
        ]);

        const gross = payments[0]?.total || 0;
        const royaltyPct = school.franchiseSettings?.royaltyPercentage || 0;
        const royaltyAmount = (gross * royaltyPct) / 100;

        res.status(200).json({
            success: true,
            data: {
                gross,
                royaltyPct,
                royaltyAmount,
                netProfit: gross - royaltyAmount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
