const School = require('../models/School');
const User = require('../models/User');

// @desc    Get all branches for a head office
// @route   GET /api/v1/schools/branches
exports.getBranches = async (req, res) => {
    try {
        const headOfficeId = req.user.schoolId;
        
        // Find schools where parentSchoolId matches this user's schoolId
        const branches = await School.find({ parentSchoolId: headOfficeId });
        
        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new branch
// @route   POST /api/v1/schools/branches
exports.createBranch = async (req, res) => {
    try {
        const headOfficeId = req.user.schoolId;
        const { name, address, subscriptionPlan } = req.body;

        const branch = await School.create({
            name,
            address,
            subscriptionPlan: subscriptionPlan || 'BASIC',
            parentSchoolId: headOfficeId,
            isHeadOffice: false
        });

        res.status(201).json({
            success: true,
            data: branch
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get consolidated stats for Head Office
// @route   GET /api/v1/schools/head-office/stats
exports.getHeadOfficeStats = async (req, res) => {
    try {
        const headOfficeId = req.user.schoolId;
        const branches = await School.find({ parentSchoolId: headOfficeId });
        const branchIds = branches.map(b => b._id);
        
        // Add head office itself to the scope
        const allIds = [headOfficeId, ...branchIds];
        
        // We will sum stats across all these IDs
        // For simplicity, we just return the branch list for the dashboard to aggregate
        res.status(200).json({
            success: true,
            totalBranches: branches.length,
            branchList: branches
        });
    } catch (error) {
       res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Search schools by name (for parents)
// @route   GET /api/v1/schools/search
exports.searchSchools = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ success: true, data: [] });

        const schools = await School.find({ 
            name: { $regex: q, $options: 'i' } 
        }).select('name _id').limit(10);

        res.status(200).json({
            success: true,
            data: schools
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
